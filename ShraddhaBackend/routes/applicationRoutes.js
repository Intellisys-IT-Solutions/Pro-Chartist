const express = require('express');
const multer = require('multer');
const ApplicationByDate = require('../models/ApplicationByDate');
const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Route to submit a new application with an image upload
router.post('/', upload.single('image'), async (req, res) => {
  const { name, mobile } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if date document already exists
    let record = await ApplicationByDate.findOne({ date: today });

    if (!record) {
      // Create new date document with first application
      record = new ApplicationByDate({
        date: today,
        applications: [{ name, mobile, imageUrl, status: 'pending' }]
      });
    } else {
      // Append new application to existing date
      record.applications.push({ name, mobile, imageUrl, status: 'pending' });
    }

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to retrieve all applications
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  try {
    const record = await ApplicationByDate.findOne({ date });
    if (!record) return res.json({ applications: [] });

    res.json({ applications: record.applications });
  } catch (err) {
    console.error('Error fetching applications by date:', err);
    res.status(500).json({ error: err.message });
  }
});


// Route to update the status of an application by ID
router.put('/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const updatedApplicationByDate = await ApplicationByDate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedApplicationByDate) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(updatedApplicationByDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
