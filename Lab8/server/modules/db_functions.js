const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB;

const mongo_models = require('./mongo_models');
  const NewsModel = mongo_models.NewsModel;
  const LastDocModel = mongo_models.LastDocModel;
  const NBAStatsModel = mongo_models.NBAStatsModel;

async function connect() {
  await mongoose.connect(MONGODB_URI);
}

async function disconnect() {
  await mongoose.disconnect();
}

async function getDbIndices() {
  const result = await NewsModel.find({});
  let output = [];
  for (let i = 0; i < result.length; i++) {
    output.push(result[i].index);
  }
  return output;
}

async function getLastIndex() {
  const result = await LastDocModel.find({});
  return result[0].ind;
}

async function incrementLastIndex() {
  let newInd = await getLastIndex() + 1;
  await LastDocModel.updateOne({}, {
    ind: newInd
  });
}

async function getNBAPlayers() {
  const result = await NBAStatsModel.find({});
  let output = [];
  for (let i = 0; i < result.length; i++) {
    output.push(result[i].name);
  }
  return output;
}

module.exports = {
  connect,
  disconnect,
  getDbIndices,
  getLastIndex,
  incrementLastIndex,
  getNBAPlayers
};