const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  currentLeague: {
    startDate: String,
    nextLeagueStart: String,
    participants: Number,
    traders: [
      {
        rank: Number,
        name: String,
        trades: Number,
        roi: Number
      }
    ]
  }
});

module.exports = mongoose.model('League', leagueSchema);
