const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

const isProjectMember = (project, userId) =>
  project.members.some((m) => m.toString() === userId);

// Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check authorization
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = isProjectMember(project, req.user.id);
    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', ['name', 'email'])
      .populate('createdBy', ['name', 'email']);

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', ['name', 'email'])
      .populate('createdBy', ['name', 'email'])
      .populate('project');

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Check authorization
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = isProjectMember(project, req.user.id);
    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate, tags } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ msg: 'Title and project are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check authorization
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = isProjectMember(project, req.user.id);
    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo,
      priority,
      dueDate,
      tags,
      createdBy: req.user.id
    });

    await task.save();
    await task.populate('assignedTo', ['name', 'email']);
    await task.populate('createdBy', ['name', 'email']);

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = isProjectMember(project, req.user.id);
    if (!isOwner && !isMember) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { title, description, status, assignedTo, priority, dueDate, tags } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignedTo', ['name', 'email']);
    await task.populate('createdBy', ['name', 'email']);

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
