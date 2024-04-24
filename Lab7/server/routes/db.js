const express = require('express');
const router = express.Router();

const db_functions = require('../modules/db_functions');
  const connect = db_functions.connect;
  const disconnect = db_functions.disconnect;
  const getDbIndices = db_functions.getDbIndices;
  const getLastIndex = db_functions.getLastIndex;
  const incrementLastIndex = db_functions.incrementLastIndex;
const mongo_models = require('../modules/mongo_models');
  const NewsModel = mongo_models.NewsModel;

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkCategories = err_check.checkCategories;
  const checkSnippet = err_check.checkSnippet;
  const checkLanguage = err_check.checkLanguage;
  const checkPublished_at = err_check.checkPublished_at;
  const checkSource = err_check.checkSource;
  const checkLocale = err_check.checkLocale;

const helper = require('../modules/helper');
  const getLatestDay = helper.getLatestDay;

const values = require('../modules/values');
  const CATEGORIES = values.CATEGORIES;

router.get('/', (req, res) => {
  const getIndices = async () => {
    const result = await getDbIndices();
    let output = [];
    for (let i = 0; i < result.length; i++) {
      output.push("/db/" + result[i]);
    }
    res.send(output);
  };
  const func = async () => {
    await connect();
    await getIndices();
    await disconnect();
  };
  func();
});

router.get('/0', (req, res) => {
  const getIndices = async () => {
    const result = await getDbIndices();
    let output = [];
    for (let i = 0; i < result.length; i++) {
      output.push("/db/" + result[i]);
    }
    res.send(output);
  };
  const func = async () => {
    await connect();
    await getIndices();
    await disconnect();
  };
  func();
});

router.get('/:number', (req, res) => {
  const getDoc = async () => {
    let path = req.path.split("/");
    let index = parseInt(path[path.length-1]);
    
    if (!index || index.toString() != path[path.length-1]) {
      const indices = await getDbIndices();
      res.status(400).json({
        error: "Index is not an integer. Valid indices: " + indices
      });
      return;
    }

    const result = await NewsModel.find({index: index});
    if (result.length == 0) {
      const indices = await getDbIndices();
      res.status(404).json({
        error: "Index not found. Valid indices: " + indices
      });
      return;
    }

    res.status(200).json(result[0]);
  };
  const func = async () => {
    await connect();
    await getDoc();
    await disconnect();
  };
  func();
});

router.post('/', (req, res) => {
  const postDoc = async () => {
    // Defaults
    let uuid = await getLastIndex() + 1;
    let title = "";
    let description = "";
    let keywords = "";
    let snippet = "";
    let url = "#";
    let image_url = "#";
    let language = "en";
    let published_at = getLatestDay();
    let source = "#";
    let categories = ["general"];
    let locale = "us";
    let index = uuid;

    // Error checking
    if (!checkParameters(res, Object.keys(req.body), ["title", "description", "keywords", "snippet", "url", "image_url", "language", "published_at", "source", "categories", "locale"])) {
      return;
    }

    if (req.body.title) {
      title = req.body.title;
    }
    
    if (req.body.description) {
      description = req.body.description;
    }
    
    if (req.body.keywords) {
      keywords = req.body.keywords;
    }

    if (req.body.snippet) {
      if (!checkSnippet(res, req.body.snippet)) {
        return;
      }
      snippet = req.body.snippet;
    }

    if (req.body.url || req.body.url == "") {
      url = req.body.url;
    }
    
    if (req.body.image_url || req.body.image_url == "") {
      image_url = req.body.image_url;
    }

    if (req.body.language || req.body.language == "") {
      if (!checkLanguage(res, req.body.language)) {
        return;
      }
      language = req.body.language;
    }

    if (req.body.published_at || req.body.published_at == "") {
      if (!checkPublished_at(res, req.body.published_at)) {
        return;
      }
      let givenDate = req.body.published_at.split("-");
      let year = givenDate[0];
      let month = givenDate[1];
      let day = givenDate[2];
      published_at = year + '-' + month + '-' + day;
    }

    if (req.body.source || req.body.source == "") {
      if (!checkSource(res, req.body.source)) {
        return;
      }
      source = req.body.source;
    }
    
    if (req.body.categories || req.body.categories == "") {
      let givenCategories = req.body.categories.split(",");
      if (!checkCategories(res, req.body.categories.split(","),CATEGORIES)) {
        return;
      }
      categories = givenCategories;
    }

    if (req.body.locale || req.body.locale == "") {
      if (!checkLocale(res, req.body.locale)) {
        return;
      }
      locale = req.body.locale;
    }

    const doc = await NewsModel.create({
      uuid: uuid,
      title: title,
      description: description,
      keywords: keywords,
      snippet: snippet,
      url: url,
      image_url: image_url,
      language: language,
      published_at: published_at,
      source: source,
      categories: categories,
      locale: locale,
      index: index
    });

    await incrementLastIndex();

    res.status(201).json(doc);
  };
  const func = async () => {
    await connect();
    await postDoc();
    await disconnect();
  };
  func();
});

router.post('/*', (req, res) => {
  res.status(405).json({
    error: "POST /db/:number is forbidden. To post a new document, use POST /news"
  });
});

router.put('/', (req, res) => {
  const putAllDocs = async () => {
    let title = "";
    let description = "";
    let keywords = "";
    let snippet = "";
    let url = "#";
    let image_url = "#";
    let language = "en";
    let published_at = getLatestDay();
    let source = "#";
    let categories = ["general"];
    let locale = "us";

    if (!checkParameters(res, Object.keys(req.body), ["title", "description", "keywords", "snippet", "url", "image_url", "language", "published_at", "source", "categories", "locale"])) {
      return;
    }

    if (req.body.title) {
      title = req.body.title;
    }
    
    if (req.body.description) {
      description = req.body.description;
    }
    
    if (req.body.keywords) {
      keywords = req.body.keywords;
    }

    if (req.body.snippet) {
      if (!checkSnippet(res, req.body.snippet)) {
        return;
      }
      snippet = req.body.snippet;
    }

    if (req.body.url || req.body.url == "") {
      url = req.body.url;
    }
    
    if (req.body.image_url || req.body.image_url == "") {
      image_url = req.body.image_url;
    }

    if (req.body.language || req.body.language == "") {
      if (!checkLanguage(res, req.body.language)) {
        return;
      }
      language = req.body.language;
    }

    if (req.body.published_at || req.body.published_at == "") {
      if (!checkPublished_at(res, req.body.published_at)) {
        return;
      }
      let givenDate = req.body.published_at.split("-");
      let year = givenDate[0];
      let month = givenDate[1];
      let day = givenDate[2];
      published_at = year + '-' + month + '-' + day;
    }

    if (req.body.source || req.body.source == "") {
      if (!checkSource(res, req.body.source)) {
        return;
      }
      source = req.body.source;
    }
    
    if (req.body.categories || req.body.categories == "") {
      let givenCategories = req.body.categories.split(",");
      if (!checkCategories(res, req.body.categories.split(","),CATEGORIES)) {
        return;
      }
      categories = givenCategories;
    }

    if (req.body.locale || req.body.locale == "") {
      if (!checkLocale(res, req.body.locale)) {
        return;
      }
      locale = req.body.locale;
    }

    const docs = await NewsModel.find({});
    for (let i = 0; i < docs.length; i++) {
      await NewsModel.updateOne({ index: docs[i].index }, {
        uuid: docs[i].uuid,
        title: title,
        description: description,
        keywords: keywords,
        snippet: snippet,
        url: url,
        image_url: image_url,
        language: language,
        published_at: published_at,
        source: source,
        categories: categories,
        locale: locale,
        index: docs[i].index
      });
    }

    res.status(201).send("All docs updated successfully");
  };
  const func = async () => {
    await connect();
    await putAllDocs();
    await disconnect();
  };
  func();
});

router.put('/:number', (req, res) => {
  const putDoc = async () => {
    let path = req.path.split("/");
    let index = parseInt(path[path.length-1]);
    
    if (!index || index.toString() != path[path.length-1]) {
      const indices = await getDbIndices();
      res.status(400).json({
        error: "Index is not an integer. Valid indices: " + indices
      });
      return;
    }

    const result = await NewsModel.findOne({index: index});
    if (!result) {
      const indices = await getDbIndices();
      res.status(404).json({
        error: "Index not found. Valid indices: " + indices
      });
      return;
    }

    let title = "";
    let description = "";
    let keywords = "";
    let snippet = "";
    let url = "#";
    let image_url = "#";
    let language = "en";
    let published_at = getLatestDay();
    let source = "#";
    let categories = ["general"];
    let locale = "us";

    if (!checkParameters(res, Object.keys(req.body), ["title", "description", "keywords", "snippet", "url", "image_url", "language", "published_at", "source", "categories", "locale"])) {
      return;
    }

    if (req.body.title) {
      title = req.body.title;
    }
    
    if (req.body.description) {
      description = req.body.description;
    }
    
    if (req.body.keywords) {
      keywords = req.body.keywords;
    }

    if (req.body.snippet) {
      if (!checkSnippet(res, req.body.snippet)) {
        return;
      }
      snippet = req.body.snippet;
    }

    if (req.body.url || req.body.url == "") {
      url = req.body.url;
    }
    
    if (req.body.image_url || req.body.image_url == "") {
      image_url = req.body.image_url;
    }

    if (req.body.language || req.body.language == "") {
      if (!checkLanguage(res, req.body.language)) {
        return;
      }
      language = req.body.language;
    }

    if (req.body.published_at || req.body.published_at == "") {
      if (!checkPublished_at(res, req.body.published_at)) {
        return;
      }
      let givenDate = req.body.published_at.split("-");
      let year = givenDate[0];
      let month = givenDate[1];
      let day = givenDate[2];
      published_at = year + '-' + month + '-' + day;
    }

    if (req.body.source || req.body.source == "") {
      if (!checkSource(res, req.body.source)) {
        return;
      }
      source = req.body.source;
    }
    
    if (req.body.categories || req.body.categories == "") {
      let givenCategories = req.body.categories.split(",");
      if (!checkCategories(res, req.body.categories.split(","),CATEGORIES)) {
        return;
      }
      categories = givenCategories;
    }

    if (req.body.locale || req.body.locale == "") {
      if (!checkLocale(res, req.body.locale)) {
        return;
      }
      locale = req.body.locale;
    }

    await NewsModel.updateOne({index: result.index}, {
      uuid: result.uuid,
      title: title,
      description: description,
      keywords: keywords,
      snippet: snippet,
      url: url,
      image_url: image_url,
      language: language,
      published_at: published_at,
      source: source,
      categories: categories,
      locale: locale,
      index: result.index
    });
    
    const updatedArticle = await NewsModel.findOne({index: result.index});

    res.status(201).json({
      updatedArticle: updatedArticle,
      endpoint: "/db/" + updatedArticle.index
    });
  };
  const func = async () => {
    await connect();
    await putDoc();
    await disconnect();
  };
  func();
});

router.delete('/', (req, res) => {
  const deleteAllDocs = async () => {
    const result = await NewsModel.deleteMany({});
    res.status(200).json({
      numAffectedDocuments: result.deletedCount
    });
  };
  const func = async () => {
    await connect();
    await deleteAllDocs();
    await disconnect();
  };
  func();
});

router.delete('/:number', (req, res) => {
  const deleteDoc = async () => {
    let path = req.path.split("/");
    let index = parseInt(path[path.length-1]);
    
    if (!index || index.toString() != path[path.length-1]) {
      const indices = await getDbIndices();
      res.status(400).json({
        error: "Index is not an integer. Valid indices: " + indices
      });
      return;
    }

    const result = await NewsModel.deleteOne({index: index});
    res.status(200).json({
      numAffectedDocuments: result.deletedCount
    });
  };
  const func = async () => {
    await connect();
    await deleteDoc();
    await disconnect();
  };
  func();
});

module.exports = router;