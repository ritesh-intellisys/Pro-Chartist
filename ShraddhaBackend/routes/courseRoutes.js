const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { imageStorage } = require('../config/cloudinary');
const upload = multer({ storage: imageStorage });

// GET all
router.get('/', getCourses);
// ADD
router.post('/', upload.single('image'), addCourse);
// UPDATE
router.put('/:id', upload.single('image'), updateCourse);
// DELETE
router.delete('/:id', deleteCourse);

module.exports = router; 