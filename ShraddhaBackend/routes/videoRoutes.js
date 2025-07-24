const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, videoStorage, imageStorage } = require('../config/cloudinary');
const videoUpload = multer({ storage: videoStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB for videos
const imageUpload = multer({ storage: imageStorage });
const path = require('path');
const {
  getAllVideos,
  getVideoById,
  createOrUpdateVideo,
  updateVideo,
  deleteVideo,
  bulkUpdateVideos
} = require('../controllers/videoController');

// File upload endpoints
router.post('/upload/image', (req, res) => {
  imageUpload.single('file')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary image upload error:', err);
      return res.status(500).json({ error: err.message || 'Image upload failed' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
    res.json({ url: req.file.path });
  });
});

router.post('/upload/video', (req, res) => {
  videoUpload.single('file')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary video upload error:', err);
      return res.status(500).json({ error: err.message || 'Video upload failed' });
    }
    if (!req.file) return res.status(400).json({ error: 'No video uploaded or file too large (max 10MB for videos).' });
    res.json({ url: req.file.path });
  });
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