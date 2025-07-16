const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  mobile: { type: String },

  // Reset password via token
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Reset password via OTP
  otpCode: String,
  otpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
