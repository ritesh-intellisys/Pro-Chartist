// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Import routes
const adminRoutes = require('./routes/admin');
const leagueRoutes = require('./routes/league');
const applicationsByDateRoutes = require('./routes/applicationsByDateRoutes');
const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const videoRoutes = require('./routes/videoRoutes');

// Import Admin model
const Admin = require('./models/Admin');

const app = express();
connectDB();

// ✅ CORS Middleware (dynamic origin or wildcard during dev)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost:* during development
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// ✅ Routes
app.use('/api/admin', adminRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/users', authRoutes);
app.use('/api', otpRoutes);
app.use('/api/applicationsByDate', applicationsByDateRoutes);
app.use('/api/videos', videoRoutes);

// ✅ Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const existing = await Admin.findOne({ email: 'admin@example.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await Admin.create({ email: 'admin@example.com', password: hashed, role: 'admin' });
      console.log('✅ Default admin created');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
};

createDefaultAdmin();

// Root route
app.get('/', (req, res) => {
  res.send('✅ API is working');
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
