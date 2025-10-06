const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Link = require('../models/Link');
const Folder = require('../models/Folder');

// Get all links for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).populate('folder');
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new link
router.post('/', auth, async (req, res) => {
  const { title, url, type, description, tags, folder } = req.body;
  try {
    // Validate folder exists and belongs to user
    if (folder) {
      const folderExists = await Folder.findOne({ _id: folder, user: req.user.id });
      if (!folderExists) return res.status(400).json({ message: 'Invalid folder' });
    }
    const newLink = new Link({
      title,
      url,
      type,
      description,
      user: req.user.id,
      tags: tags || [],
      folder: folder || null
    });
    const link = await newLink.save();
    await link.populate('folder');
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a link
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user.id });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    await link.deleteOne();
    res.json({ message: 'Link deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;