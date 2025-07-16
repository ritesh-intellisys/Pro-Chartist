// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  sendOtp,
  verifyOtp,
  resetPasswordWithOtp
} = require('../controllers/authController');

// 🔐 Auth routes
router.post('/signup', signup);
router.post('/login', login);

// 🔁 Forgot password with OTP flow
router.post('/forgot-password', forgotPassword); // Triggers OTP send
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password-with-otp', resetPasswordWithOtp);

module.exports = router;
