const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  validity: String,
  discount: String,
  currentPrice: String,
  originalPrice: String,
  imageUrl: String,
  imagePublicId: String,
});

module.exports = mongoose.model('Course', courseSchema); 