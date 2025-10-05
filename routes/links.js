const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Link = require('../models/Link');

// Get all links for user
router.get('/', protect, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    console.log(err)
    res.status(500).send('Server error');
  }
});

// Add link
router.post('/', protect, async (req, res) => {
  const { url, title, type, description } = req.body;
  try {
    const newLink = new Link({ user: req.user.id, url, title, type, description });
    await newLink.save();
    res.json(newLink);
  } catch (err) {
    console.error(err); // Add this line
    res.status(500).send('Server error');
  }
});

// Delete link
router.delete('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link || link.user.toString() !== req.user.id) return res.status(404).json({ msg: 'Link not found' });
    await link.deleteOne({_id: link._id});
    res.json({ msg: 'Link removed' });
  } catch (err) {
    console.log(err)
    res.status(500).send('Server error');
  }
});

module.exports = router;