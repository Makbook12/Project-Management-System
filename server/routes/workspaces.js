const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Get all workspaces for current user
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', ['name', 'email']).populate('members.user', ['name', 'email']);

    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single workspace
router.get('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', ['name', 'email'])
      .populate('members.user', ['name', 'email']);

    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check authorization
    const isOwner = workspace.owner._id.toString() === req.user.id;
    const isMember = workspace.members.some(m => m.user._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create workspace
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ msg: 'Workspace name is required' });
    }

    const workspace = new Workspace({
      name,
      description,
      color: color || '#3B82F6',
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    await workspace.save();
    await workspace.populate('owner', ['name', 'email']);
    await workspace.populate('members.user', ['name', 'email']);

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update workspace
router.put('/:id', auth, async (req, res) => {
  try {
    let workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, description, color } = req.body;
    if (name) workspace.name = name;
    if (description) workspace.description = description;
    if (color) workspace.color = color;

    await workspace.save();
    await workspace.populate('owner', ['name', 'email']);
    await workspace.populate('members.user', ['name', 'email']);

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete workspace
router.delete('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Workspace deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add member to workspace
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already a member
    const isMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (isMember) {
      return res.status(400).json({ msg: 'User is already a member' });
    }

    workspace.members.push({ user: user._id, role });
    await workspace.save();
    await workspace.populate('owner', ['name', 'email']);
    await workspace.populate('members.user', ['name', 'email']);

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Can't remove owner
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ msg: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await workspace.save();
    await workspace.populate('owner', ['name', 'email']);
    await workspace.populate('members.user', ['name', 'email']);

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update member role
router.put('/:id/members/:userId', auth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ msg: 'Workspace not found' });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const member = workspace.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }

    member.role = role;
    await workspace.save();
    await workspace.populate('owner', ['name', 'email']);
    await workspace.populate('members.user', ['name', 'email']);

    res.json(workspace);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
