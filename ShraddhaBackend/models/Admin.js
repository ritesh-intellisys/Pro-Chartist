const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'master-admin'],
    default: 'admin'
  },
  otpCode: String,
  otpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
