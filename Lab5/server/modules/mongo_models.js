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
const NewsModel = mongoose.model("news", newsSchema);

const lastDocSchema = {
  ind: Number
};
const LastDocModel = mongoose.model("lastdoc", lastDocSchema, "lastdoc"); //third arg to make sure it doesn't pluralize

module.exports = {
  NewsModel,
  LastDocModel
};