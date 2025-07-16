const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
    });

    const html = `
      <h3>Your OTP Code</h3>
      <p>Your verification code is: <b>${otpCode}</b></p>
      <p>This code will expire in 5 minutes.</p>
    `;

    await sendEmail(email, 'Your OTP Code', html);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('❌ Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const otp = await Otp.findOne({ email, code });

    if (!otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (otp.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' });

    await Otp.deleteOne({ _id: otp._id });

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('❌ Verify OTP error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
