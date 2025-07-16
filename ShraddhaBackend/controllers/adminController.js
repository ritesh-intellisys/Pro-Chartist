// controllers/adminController.js

const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// ✅ Validate Master Link
exports.validateMasterLink = (req, res) => {
  const { token } = req.params;
  if (token === process.env.MASTER_LINK_TOKEN) {
    return res.status(200).json({ valid: true });
  }
  return res.status(401).json({ error: 'Invalid master link' });
};

// ✅ Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, role: admin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Reset Admin (Master)
exports.resetAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword, role: 'admin' });
    await newAdmin.save();
    res.json({ message: 'Admin credentials reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset admin credentials' });
  }
};

// ✅ Send OTP to Admin
exports.sendAdminOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otpCode = otp;
    admin.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await admin.save();

    const html = `<h3>Your OTP Code</h3><p><b>${otp}</b> (valid for 5 minutes)</p>`;
    await sendEmail(email, 'Admin OTP Verification', html);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ✅ Verify Admin OTP
exports.verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (admin.otpCode !== otp || admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

// ✅ Reset Password with OTP (Admin)
exports.resetPasswordWithAdminOtp = async (req, res) => {
  const { email, otp, newPassword, newEmail } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (admin.otpCode !== otp || admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update email only if different
    if (newEmail && newEmail !== email) {
      const exists = await Admin.findOne({ email: newEmail });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      admin.email = newEmail;
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otpCode = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    res.status(200).json({ message: 'Admin credentials updated successfully' });
  } catch (err) {
    console.error('Reset with OTP error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
