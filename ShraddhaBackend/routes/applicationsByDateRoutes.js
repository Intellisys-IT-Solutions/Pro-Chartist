const express = require('express');
const multer = require('multer');
const ApplicationByDate = require('../models/ApplicationByDate');
const router = express.Router();

// Multer config for image upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST - submit application
router.post('/', upload.single('image'), async (req, res) => {
  const { name, mobile } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  const today = new Date().toISOString().split("T")[0];

  try {
    let record = await ApplicationByDate.findOne({ date: today });

    if (!record) {
      record = new ApplicationByDate({
        date: today,
        applications: [{ name, mobile, imageUrl }]
      });
    } else {
      record.applications.push({ name, mobile, imageUrl });
    }

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - fetch applications by date
router.get('/', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const record = await ApplicationByDate.findOne({ date });

    if (!record) {
      return res.json(record ? record.applications : []);
    }

    res.json(record.applications);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


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
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;
