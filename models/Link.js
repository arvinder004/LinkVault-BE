const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['YouTube', 'Tweet', 'Article', 'Other'], required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }], // Array of tags
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // Reference to Folder
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);