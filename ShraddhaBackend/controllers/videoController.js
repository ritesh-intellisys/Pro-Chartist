const Video = require('../models/Video');

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ id: 1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findOne({ id: req.params.id, isActive: true });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

// Create or update video
const createOrUpdateVideo = async (req, res) => {
  try {
    const { id, title, description, thumbnail, videoUrl } = req.body;
    
    // Check if video exists
    let video = await Video.findOne({ id });
    
    if (video) {
      // Update existing video
      video.title = title;
      video.description = description;
      if (thumbnail) video.thumbnail = thumbnail;
      if (videoUrl) video.videoUrl = videoUrl;
      video.uploadedAt = new Date();
    } else {
      // Create new video
      video = new Video({
        id,
        title,
        description,
        thumbnail: thumbnail || '',
        videoUrl: videoUrl || '',
        uploadedBy: 'admin'
      });
    }
    
    await video.save();
    res.json(video);
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ error: 'Failed to save video' });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const video = await Video.findOneAndUpdate(
      { id: parseInt(id) },
      { ...updateData, uploadedAt: new Date() },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
};

// Delete video (soft delete)
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findOneAndUpdate(
      { id: parseInt(id) },
      { isActive: false },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

// Bulk update videos
const bulkUpdateVideos = async (req, res) => {
  try {
    const { videos } = req.body;
    
    const updatePromises = videos.map(async (videoData) => {
      const { id, title, description, thumbnail, videoUrl } = videoData;
      
      return Video.findOneAndUpdate(
        { id },
        {
          title,
          description,
          thumbnail: thumbnail || '',
          videoUrl: videoUrl || '',
          uploadedAt: new Date()
        },
        { upsert: true, new: true }
      );
    });
    
    const updatedVideos = await Promise.all(updatePromises);
    res.json(updatedVideos);
  } catch (error) {
    console.error('Error bulk updating videos:', error);
    res.status(500).json({ error: 'Failed to update videos' });
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  createOrUpdateVideo,
  updateVideo,
  deleteVideo,
  bulkUpdateVideos
}; 