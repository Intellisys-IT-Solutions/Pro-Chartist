const express = require('express');
const router = express.Router();
const League = require('../models/League');

// GET league data
router.get('/', async (req, res) => {
  try {
    const data = await League.findOne();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT league data (update or create if not exists)
router.put('/', async (req, res) => {
  try {
    let league = await League.findOne();
    if (!league) league = new League();
    league.currentLeague = req.body.currentLeague;
    await league.save();
    res.json(league);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
