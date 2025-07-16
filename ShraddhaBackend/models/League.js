const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  rank: Number,
  name: String,
  trades: Number,
  roi: Number
});

const leagueSchema = new mongoose.Schema({
  currentLeague: {
    startDate: String,
    nextLeagueStart: String,
    participants: Number,
    traders: [traderSchema],
  },
  previousLeague: {
    startDate: String,
    traders: [traderSchema],
  }
});

module.exports = mongoose.model('League', leagueSchema);
