const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: String, default: 'admin' },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema); 