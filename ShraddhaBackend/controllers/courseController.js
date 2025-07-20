const Course = require('../models/Course');

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
    const { title, validity, discount, currentPrice, originalPrice } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const course = new Course({ title, validity, discount, currentPrice, originalPrice, imageUrl });
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
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;
    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 