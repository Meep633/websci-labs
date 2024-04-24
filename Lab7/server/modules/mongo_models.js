const mongoose = require('mongoose');

const newsSchema = {
  uuid: {
    type: String,
    required: true,
    immutable: true
  },
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  keywords: {
    type: String,
    default: ""
  },
  snippet: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  image_url: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    default: ""
  },
  published_at: {
    type: Date,
    default: () => Date.now()
  },
  source: {
    type: String,
    default: ""
  },
  categories: {
    type: [String],
    default: []
  },
  relevance_score: {
    type: String,
    default: null
  },
  locale: {
    type: String,
    default: ""
  },
  index: {
    type: Number,
    required: true
  }
};
const NewsModel = mongoose.model("news", newsSchema, "news");

const lastDocSchema = {
  ind: Number
};
const LastDocModel = mongoose.model("lastdoc", lastDocSchema, "lastdoc"); //third arg to make sure it doesn't pluralize

const nbaStatsSchema = {
  name: {
    type: String,
    required: true
  },
  season: Number,
  games_played: Number,
  mpg: Number, //minutes per game
  ppg: Number, //points per game
  apg: Number, //assists per game
  trpg: Number, //total rebounds per game
  drpg: Number, //defensive rebounds per game
  orpg: Number, //offensive rebounds per game
  bpg: Number, //blocks per game
  spg: Number, //steals per game
  tpg: Number, //turnovers per game
  fgm: Number, //field goals made per game
  fga: Number, //field goals attempted per game
  fg_pct: Number, //field goal percentage
  '3pm': Number, //3 pointers made per game
  '3pa': Number, //3 pointers attempted per game
  '3pt_pct': Number, //3 point percentage
  ftm: Number, //free throws made per game
  fta: Number, //free throws attempted per game
  ft_pct: Number, //free throw percentage
};
const NBAStatsModel = mongoose.model("nba_stats", nbaStatsSchema, "nba_stats");

module.exports = {
  NewsModel,
  LastDocModel,
  NBAStatsModel
};