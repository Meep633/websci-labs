// console.log(process.env.MONGODB);

const fs = require('fs');
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.MONGODB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const fetchNews = async () => {
  for (let i = 65; i <= 100; i++) {
    let res = await axios.get("https://api.thenewsapi.com/v1/news/top?", {
      params: {
        api_token: 'syYRYmQjrCJOYcuqcuxHNN3fwyd48GMHWFOD1Rwy',
        locale: "us",
        categories: "general",
        limit: 1,
        page: i
      }
    });
    let fileName = "records/" + i + ".json";
    let json = res.data.data[0];
    json.index = i;
    fs.writeFile(fileName, JSON.stringify(json, null, 2), function writeJSON(err) {
      if (err) {
        console.log(err);
      }
    });
  }
}

const writeToDB = async () => {
  try {
    await client.connect();
    const news = await client.db("Lab5").collection("news");
    for (let i = 67; i <= 100; i++) {
      const doc = require('./records/' + i + '.json');
      const result = await news.insertOne(doc);
      console.log(
        `A document was inserted with the _id: ${result.insertedId}`,
      );
    }
  } finally {
    await client.close();
  }
};

async function x() {
  // await fetchNews();
  writeToDB();
}

x();