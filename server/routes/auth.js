const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (userId) => jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '7d' });
const formatUser = (user) => ({ id: user.id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified });

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email, and password are required' });

    if (await User.findOne({ email })) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const user = new User({ name, email, password: await bcrypt.hash(password, salt) });
    user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();
    sendVerificationEmail(email, user.emailVerificationToken, name).catch(e => console.error('Email error:', e.message));

    res.json({ 
      token: generateToken(user.id), 
      user: formatUser(user),
      msg: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: 'Invalid credentials' });

    res.json({ 
      token: generateToken(user.id), 
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.body.token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) return res.status(400).json({ msg: 'Invalid or expired verification token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ msg: 'No account with that email address exists' });

    user.passwordResetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    sendPasswordResetEmail(user.email, user.passwordResetToken, user.name)
      .catch(e => console.error('Email error:', e.message));

    res.json({ msg: 'Password reset email sent. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) return res.status(400).json({ msg: 'Invalid or expired reset token' });

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.passwordResetToken = user.passwordResetExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;