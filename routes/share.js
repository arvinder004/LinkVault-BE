const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const ShareToken = require('../models/ShareToken');
const Link = require('../models/Link');
const crypto = require('crypto');

// Generate shareable link
router.post('/generate', protect, async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const newToken = new ShareToken({ user: req.user.id, token });
    await newToken.save();
    const shareLink = process.env.FRONTEND_URL + `/shared/${token}`; 
    res.json({ shareLink });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get shared links (public route)
router.get('/:token', async (req, res) => {
  try {
    const shareToken = await ShareToken.findOne({ token: req.params.token });
    if (!shareToken) return res.status(404).json({ msg: 'Invalid share link' });
    const links = await Link.find({ user: shareToken.user }).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;