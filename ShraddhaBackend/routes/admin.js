const express = require('express');
const router = express.Router();

const {
  validateMasterLink,
  loginAdmin,
  resetAdmin,
  sendAdminOtp,
  verifyAdminOtp,
  resetPasswordWithAdminOtp,
} = require('../controllers/adminController');

// ✅ Admin Auth Routes
router.post('/login', loginAdmin);
router.post('/reset', resetAdmin);

// ✅ Master Link
router.get('/validate-master-link/:token', validateMasterLink);

// ✅ OTP Based Password Reset
router.post('/send-otp', sendAdminOtp);
router.post('/verify-otp', verifyAdminOtp);
router.post('/reset-password-with-otp', resetPasswordWithAdminOtp);

module.exports = router;
