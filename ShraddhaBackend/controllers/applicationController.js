const Application = require('../models/Application');

// ✅ Submit new application
const submitApplication = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and Mobile are required' });
    }

    const newApp = new Application({ name, mobile, imageUrl });
    await newApp.save();

    res.status(201).json({ application: newApp });
  } catch (error) {
    console.error('❌ Error submitting application:', error.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};



// ✅ Get all applications
const getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find().sort({ submittedAt: -1 });
    res.json(apps);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// ✅ Update status
const updateApplicationStatus = async (req, res) => {
  try {
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedApp);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  updateApplicationStatus
};
