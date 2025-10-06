const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Folder = require('../models/Folder');

// Get all folders for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user.id }).populate('parent');
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new folder
router.post('/', auth, async (req, res) => {
  const { name, parent } = req.body;
  try {
    // Validate parent folder exists and belongs to user
    if (parent) {
      const parentFolder = await Folder.findOne({ _id: parent, user: req.user.id });
      if (!parentFolder) return res.status(400).json({ message: 'Invalid parent folder' });
    }
    const newFolder = new Folder({
      name,
      user: req.user.id,
      parent: parent || null
    });
    const folder = await newFolder.save();
    await folder.populate('parent');
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a folder
router.put('/:id', auth, async (req, res) => {
  const { name, parent } = req.body;
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    // Validate parent folder
    if (parent) {
      const parentFolder = await Folder.findOne({ _id: parent, user: req.user.id });
      if (!parentFolder) return res.status(400).json({ message: 'Invalid parent folder' });
      // Prevent circular references
      if (parent === req.params.id) return res.status(400).json({ message: 'Folder cannot be its own parent' });
    }
    folder.name = name || folder.name;
    folder.parent = parent || folder.parent;
    await folder.save();
    await folder.populate('parent');
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    // Move links in this folder to no folder
    await Link.updateMany({ folder: req.params.id, user: req.user.id }, { $set: { folder: null } });
    // Delete subfolders
    await Folder.deleteMany({ parent: req.params.id, user: req.user.id });
    await folder.deleteOne();
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;