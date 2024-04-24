const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB;
const mongo_models = require('../modules/mongo_models');
const NewsModel = mongo_models.NewsModel;
// const LastIndexModel = mongo_models.LastIndexModel;
const db_functions = require('../modules/db_functions');
const connect = db_functions.connect;
const disconnect = db_functions.disconnect;
const incrementLastIndex = db_functions.incrementLastIndex;
const getLastIndex = db_functions.getLastIndex;

async function initRecords() {
  await connect();
  for (let i = 1; i <= 100; i++) {
    const json = require('../../records/' + i + '.json');
    await NewsModel.create(json);
  }
  await disconnect();
}

async function updateRecord(index) {
  await connect();
  let doc = await NewsModel.findOne({index: index});
  if (doc) {
    console.log("found doc");
    console.log(doc.published_at);
    const docAgain = await NewsModel.find({
      _id: doc._id,
      uuid: doc.uuid,
      title: doc.title,
      description: doc.description,
      keywords: doc.keywords,
      snippet: doc.snippet,
      url: doc.url,
      image_url: doc.image_url,
      language: doc.language,
      index: doc.index
    });
    if (docAgain) {
      console.log("found doc again");
      console.log(docAgain);
      console.log(doc.published_at);
      console.log(docAgain[0].published_at);
      console.log(docAgain.published_at == doc.published_at);
    }
  } else {
    console.log("doc not found");
  }
  await disconnect();
}

// initRecords();
updateRecord(1);