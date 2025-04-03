const mongoose = require('mongoose');

const ApplicationByDateSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g. "2025-04-04"
  applications: [
    {
      name: String,
      mobile: String,
      imageUrl: String,
      status: { type: String, default: 'pending' }
    }
  ]
});

module.exports = mongoose.model('ApplicationByDate', ApplicationByDateSchema);
