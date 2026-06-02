const nodemailer = require('nodemailer');

// Configure your email service here
let transporter;

const isValidConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
                    !process.env.EMAIL_USER.includes('your_email');

if (isValidConfig) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false
  });
}

const sendVerificationEmail = async (email, token, userName) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@projectmanager.com',
    to: email,
    subject: 'Email Verification - Project Manager',
    html: `<h2>Welcome ${userName}!</h2><p>Verify your email: <a href="${verificationUrl}">Click here</a></p><p>Link expires in 24 hours.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn('Email service unavailable:', error.message);
    return null;
  }
};

const sendPasswordResetEmail = async (email, token, userName) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@projectmanager.com',
    to: email,
    subject: 'Password Reset - Project Manager',
    html: `<h2>Password Reset</h2><p>Hi ${userName},</p><p>Reset your password: <a href="${resetUrl}">Click here</a></p><p>Link expires in 1 hour.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Error sending password reset email. Please try again later.');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
