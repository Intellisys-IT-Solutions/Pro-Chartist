const express = require('express');
const multer = require('multer');
const ApplicationByDate = require('../models/ApplicationByDate');
const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST new application
router.post('/', upload.single('image'), async (req, res) => {
  const { name, mobile } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  const today = new Date().toISOString().split("T")[0];

  try {
    let record = await ApplicationByDate.findOne({ date: today });

    if (!record) {
      record = new ApplicationByDate({
        date: today,
        applications: [{ name, mobile, imageUrl, status: 'pending' }]
      });
    } else {
      record.applications.push({ name, mobile, imageUrl, status: 'pending' });
    }

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET applications by date
router.get('/range', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Start and end dates are required' });

  try {
    const records = await ApplicationByDate.find({
      date: { $gte: start, $lte: end }
    });

    // Flatten all applications from different dates
    const applications = records.flatMap(record => record.applications);

    res.json({ applications });
  } catch (err) {
    console.error('Range fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update status of one application
router.put('/:appId', async (req, res) => {
  const { appId } = req.params;
  const { status } = req.body;

  try {
    const doc = await ApplicationByDate.findOneAndUpdate(
      { "applications._id": appId },
      { $set: { "applications.$.status": status } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ error: 'Application not found' });

    const updatedApp = doc.applications.find(app => app._id.toString() === appId);
    res.json(updatedApp);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;
