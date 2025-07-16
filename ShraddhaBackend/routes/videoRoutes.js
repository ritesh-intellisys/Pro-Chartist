const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads') });
const {
  getAllVideos,
  getVideoById,
  createOrUpdateVideo,
  updateVideo,
  deleteVideo,
  bulkUpdateVideos
} = require('../controllers/videoController');

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the relative URL to the uploaded file
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Get all videos
router.get('/', getAllVideos);

// Get video by ID
router.get('/:id', getVideoById);

// Create or update video
router.post('/', createOrUpdateVideo);

// Update video
router.put('/:id', updateVideo);

// Delete video
router.delete('/:id', deleteVideo);

// Bulk update videos
router.put('/bulk/update', bulkUpdateVideos);

module.exports = router; 