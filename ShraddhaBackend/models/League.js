const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  rank: Number,
  name: String,
  trades: Number,
  roi: Number
});

const topTraderSchema = new mongoose.Schema({
  date: String,
  name: String,
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
  },
  topTraders: [
    {
      date: String,
      name: String,
      roi: Number
    }
  ]
});

module.exports = mongoose.model('League', leagueSchema);
