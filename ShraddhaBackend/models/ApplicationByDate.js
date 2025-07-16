const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: String,
  imageUrl: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const applicationByDateSchema = new mongoose.Schema({
  date: String, // Format: 'YYYY-MM-DD'
  applications: [applicationSchema],
});

module.exports = mongoose.model('ApplicationByDate', applicationByDateSchema);
