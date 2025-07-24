const Course = require('../models/Course');
const cloudinary = require('cloudinary').v2;

// GET all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD new course
exports.addCourse = async (req, res) => {
  try {
    console.log('addCourse route hit'); // Confirm route is hit
    console.log('req.file:', req.file); // Debug: log the uploaded file info
    const { title, validity, discount, currentPrice, originalPrice } = req.body;
    const imageUrl = req.file ? req.file.path : '';
    const imagePublicId = req.file ? req.file.filename : '';
    const course = new Course({ title, validity, discount, currentPrice, originalPrice, imageUrl, imagePublicId });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE course
exports.updateCourse = async (req, res) => {
  try {
    const { title, validity, discount, currentPrice, originalPrice } = req.body;
    const update = { title, validity, discount, currentPrice, originalPrice };
    if (req.file) {
      update.imageUrl = req.file.path;
      update.imagePublicId = req.file.filename;
    }
    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function getCloudinaryPublicId(url) {
  // Remove query params and file extension
  const withoutExtension = url.split('?')[0].replace(/\.[^/.]+$/, '');
  // Find the part after '/upload/' (Cloudinary's upload folder)
  const match = withoutExtension.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1] : null;
}

// DELETE course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course && course.imagePublicId) {
      await cloudinary.uploader.destroy(course.imagePublicId);
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 