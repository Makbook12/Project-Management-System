const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and Word documents allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all projects for user (owned or member)
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ]
    }).populate('owner', ['name', 'email']).populate('members', ['name', 'email']);

    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', ['name', 'email'])
      .populate('members', ['name', 'email']);

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is owner or member
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(m => m._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create project with optional file attachments
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { name, description, dueDate, color } = req.body;

    if (!name) return res.status(400).json({ msg: 'Name is required' });

    const attachments = (req.files || []).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }));

    const project = new Project({
      name,
      description,
      dueDate,
      color,
      owner: req.user.id,
      members: [req.user.id],
      attachments
    });

    await project.save();
    await project.populate('owner', ['name', 'email']);
    await project.populate('members', ['name', 'email']);

    res.json(project);
  } catch (err) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(path.join(uploadDir, file.filename), () => {});
      });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, description, status, dueDate, color } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (dueDate) project.dueDate = dueDate;
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', ['name', 'email']);
    await project.populate('members', ['name', 'email']);

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (project.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({ msg: 'User already member' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', ['name', 'email']);

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Download attachment
router.get('/:id/attachments/:filename', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is owner or member
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(m => m.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const filePath = path.join(uploadDir, req.params.filename);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete attachment
router.delete('/:id/attachments/:filename', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    project.attachments = project.attachments.filter(a => a.filename !== req.params.filename);
    
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Clean up attached files
    project.attachments.forEach(attachment => {
      const filePath = path.join(uploadDir, attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
