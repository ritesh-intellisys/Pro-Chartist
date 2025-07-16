const express = require('express');
const router = express.Router();
const League = require('../models/League');

// ✅ GET league data
router.get('/', async (req, res) => {
  try {
    const league = await League.findOne(); // get latest document
    if (!league) return res.status(404).json({ error: 'No league found' });
    res.json(league);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch league data' });
  }
});

// ✅ PUT to update current league
router.put('/', async (req, res) => {
  try {
    const { currentLeague } = req.body;

    const updatedLeague = await League.findOneAndUpdate(
      {},
      { currentLeague },
      { new: true, upsert: true }
    );

    res.json(updatedLeague);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update league data' });
  }
});

module.exports = router;
