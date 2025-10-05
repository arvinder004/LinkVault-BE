const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['YouTube', 'Tweet', 'Article', 'Other'], default: 'Other' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Link', linkSchema);