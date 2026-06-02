const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

function explainMongoError(err) {
  const msg = err.message || '';
  if (/whitelist|IP address|network/i.test(msg)) {
    return [
      'MongoDB Atlas rejected this machine (IP not on the allow list).',
      '  • Atlas → Network Access → Add Current IP (you must repeat when your home IP changes)',
      '  • Or allow 0.0.0.0/0 for development only (less secure)',
      '  • Or use local MongoDB in .env: MONGODB_URI=mongodb://127.0.0.1:27017/project-management',
    ].join('\n');
  }
  if (/authentication failed|bad auth/i.test(msg)) {
    return 'MongoDB login failed — check username/password in MONGODB_URI.';
  }
  if (!process.env.MONGODB_URI) {
    return 'MONGODB_URI is missing. Copy server/.env.example to server/.env';
  }
  return msg;
}

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.error(explainMongoError(new Error('missing uri')));
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('\nCould not connect to MongoDB:\n', explainMongoError(err), '\n');
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({
    msg: 'Database is not connected. Start MongoDB or fix MONGODB_URI in server/.env',
  });
});

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const workspaceRoutes = require('./routes/workspaces');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});