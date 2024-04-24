const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkCategories = err_check.checkCategories;
  const checkSnippet = err_check.checkSnippet;
  const checkUrl = err_check.checkUrl;
  const checkImageUrl = err_check.checkImageUrl;
  const checkLanguage = err_check.checkLanguage;
  const checkPublished_at = err_check.checkPublished_at;
  const checkSource = err_check.checkSource;
  const checkLocale = err_check.checkLocale;

const fetch = require('../modules/fetch');
  const fetchNews = fetch.fetchNews;

const helper = require('../modules/helper');
  const updateJsonFile = helper.updateJsonFile;
  const findArticle = helper.findArticle;
  const sortArticles = helper.sortArticles;
  const getLatestDay = helper.getLatestDay;
  const createNewsCategoriesObj = helper.createNewsCategoriesObj;

const values = require('../modules/values');
  const CATEGORIES = values.CATEGORIES;
  const PAGE_LIMIT = values.PAGE_LIMIT;
  const NUM_ARTICLES_LIMIT = values.NUM_ARTICLES_LIMIT;


let json = require('../data.json');

router.get('/', (req, res) => {
  // Defaults
  let locale = "us";
  let category = "general";
  let limit = 20;
  let page = 1;

  // Error checking
  if (!checkParameters(res, Object.keys(req.query), ["locale", "category", "limit", "page"])) {
    return;
  }

  if (req.query.locale || req.query.locale == "") {
    if (!checkLocale(res, req.query.locale)) {
      return;
    }
    locale = req.query.locale;
  }

  if (req.query.category || req.query.category == "") {
    if (!checkCategories(res, [req.query.category], CATEGORIES)) {
      return;
    }
    category = req.query.category;
  }

  if (req.query.limit || req.query.limit == "") {
    if (req.query.limit == "") {
      res.status(400).json({
        error: 'Invalid page \'' + req.query.limit + '\'. Limit must be a number'
      });
      return;
    }
    
    req.query.limit = parseInt(req.query.limit);
    if (!req.query.limit) {
      res.status(400).json({
        error: 'Invalid limit \'' + req.query.limit + '\'. Limit must be a number'
      });
      return;
    } 
    
    if (req.query.limit < 1 || req.query.limit > PAGE_LIMIT) {
      res.status(400).send({
        error: 'Invalid limit \'' + req.query.limit + '\'. Valid limit: 1 <= limit <= ' + PAGE_LIMIT
      });
      return;
    }
    limit = req.query.limit;
  }

  //if a category has no articles, page 1 will still be valid but return nothing
  if (req.query.page || req.query.page == "") {
    if (req.query.page == "") {
      res.status(400).json({
        error: 'Invalid page \'' + req.query.page + '\'. Page must be a number'
      });
      return;
    }

    req.query.page = parseInt(req.query.page);
    if (!req.query.page) {
      res.status(400).json({
        error: 'Invalid page \'' + req.query.page + '\'. Page must be a number'
      });
      return;
    }

    let pageLimit = Math.ceil(json[locale]["news"]["categories"][category].length / limit); //rounding up because last page can have < limit pages
    if (req.query.page < 1 || (req.query.page != 1 && req.query.page > pageLimit)) { //page 1 should always be valid even if there are no articles in a category
      pageLimit = Math.max(pageLimit, 1); //if pageLimit = 0, I don't want to tell the client that a valid page is 1 <= page <= 0
      res.status(400).json({
        error: 'Invalid page \'' + req.query.page + '\'. Given locale \'' + locale + '\', category \'' + category + '\', and limit \'' + limit + '\', a valid page is: 1 <= page <= ' + pageLimit
      });
      return;
    }
    page = req.query.page;
  }

  let retJson = [];
  //(page-1)*limit = first entry on page, page*limit = first entry on next page
  for (let i = (page-1)*limit; i < page*limit && i < json[locale]["news"]["categories"][category].length; i++) {
    retJson.push(json[locale]["news"]["categories"][category][i]);
  }
  res.json(retJson);
});

router.get('/*', (req, res) => {
  // Default
  let locale = "us";
  let category = "general";
  
  // Error checking
  if (!checkParameters(res, Object.keys(req.query), ["locale", "category"])) {
    return;
  }

  if (req.query.locale || req.query.locale == "") {
    if (!checkLocale(res, req.query.locale)) {
      return;
    }
    locale = req.query.locale;
  }

  if (req.query.category || req.query.category == "") {
    if (!checkCategories(res, [req.query.category], CATEGORIES)) {
      return;
    }
    category = req.query.category;
  }

  let path = req.path.split("/");
  let uuid = path[path.length-1];

  let ind = findArticle(json, locale, category, uuid);
  if (ind == -1) {
    res.status(404).json({
      error: 'uuid \'' + uuid + '\' in \'' + locale + ' ' + category + '\' not found'
    });
    return;
  }

  res.json(json[locale]["news"]["categories"][category][ind]);
});

router.post('/', (req, res) => {
  // Defaults
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
    if (!checkUrl(res, req.body.url)) {
      return;
    }
    url = req.body.url;
  }
  
  if (req.body.image_url || req.body.image_url == "") {
    if (!checkImageUrl(res, req.body.image_url)) {
      return;
    }
    url = req.body.image_url;
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

  let uuid = locale + "-" + json[locale]["news"].uuidNum;
  json[locale]["news"].uuidNum += 1;
  let article = {
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
    relevance_score: null,
    locale: locale
  };
  for (let i = 0; i < categories.length; i++) {
    json[locale]["news"]["categories"][categories[i]].push(article);
    sortArticles(json, locale, categories[i]);
  }
  updateJsonFile(json);

  res.json({
    uuid: uuid,
    locale: locale,
    categories: categories,
    article: article
  });
});

router.post('/latest', (req, res) => {
  async function postLatestNews() {
    // Default
    let locale = "us";
    let category = "general";
    let num_articles = 3;
    
    // Error checking
    if (!checkParameters(res, Object.keys(req.body), ["locale", "category", "num_articles"])) {
      return;
    }

    if (req.body.locale || req.body.locale == "") {
      if (!checkLocale(res, req.body.locale)) {
        return;
      }
      locale = req.body.locale;
    }

    if (req.body.category || req.body.category == "") {
      if (!checkCategories(res, [req.body.category], CATEGORIES)) {
        return;
      }
      category = req.body.category;
    }

    if (req.body.num_articles || req.body.num_articles == "") {
      if (req.body.num_articles == "") {
        res.status(400).json({
          error: 'Invalid num_articles \'' + req.body.num_articles + '\'. num_articles must be a number'
        });
        return;
      }

      req.body.num_articles = parseInt(req.body.num_articles);
      if (!req.body.num_articles) {
        res.status(400).json({
          error: 'Invalid num_articles \'' + req.body.num_articles + '\'. num_articles must be a number'
        });
        return;
      }

      if (req.body.num_articles < 1 || req.body.num_articles > NUM_ARTICLES_LIMIT) {
        res.status(400).send({
          error: 'Invalid limit \'' + req.body.num_articles + '\'. Valid limit: 1 <= limit <= ' + NUM_ARTICLES_LIMIT
        });
        return;
      }
      num_articles = req.body.num_articles;
    }

    if (json[locale]["news"]["last_updated"][category]["last_updated"] != getLatestDay()) {
      json[locale]["news"]["last_updated"][category]["last_updated"] = getLatestDay();
      json[locale]["news"]["last_updated"][category]["last_page"] = 0;
    }
    let articles = [];
    while (articles.length < num_articles) {
      let page = json[locale]["news"]["last_updated"][category]["last_page"]+1;
      json[locale]["news"]["last_updated"][category]["last_page"] += 1;

      let response = await fetchNews(locale, category, 3, page);
      if (!response.success) {
        res.status(500).json(response.output);
        return;
      }
      for (let i = 0; i < response.output.articles.length; i++) {
        let uuid = response.output.articles[i].uuid;
        if (findArticle(json, locale, category, uuid) == -1) { //if article is a duplicate, then it should already be in data.json
          let categories = response.output.articles[i].categories;
          for (let j = 0; j < categories.length; j++) {
            json[locale]["news"]["categories"][categories[j]].push(response.output.articles[i]);
          }
          articles.push(response.output.articles[i]);
        }
      }
      sortArticles(json, locale, category);
      updateJsonFile(json);
    }

    res.json({
      articles: articles
    });
  }
  postLatestNews();
});

router.put('/', (req, res) => {
  let date = new Date();

  // Defaults
  let title = "";
  let description = "";
  let keywords = "";
  let snippet = "";
  let url = "#";
  let image_url = "#";
  let language = "en";
  let published_at = getLatestDay();
  let source = "#";
  let categories = ["same"];
  let locale = "same";

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
    if (!checkUrl(res, req.body.url)) {
      return;
    }
    url = req.body.url;
  }
  
  if (req.body.image_url || req.body.image_url == "") {
    if (!checkImageUrl(res, req.body.image_url)) {
      return;
    }
    url = req.body.image_url;
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
    if (givenCategories.includes("same") && givenCategories.length != 1) {
      res.status(400).json({
        error: 'If using \'same\' category, can\'t use any other category'
      });
      return;
    }

    let validCategories = CATEGORIES.slice();
    validCategories.push("same");
    if (!checkCategories(res, givenCategories, validCategories)) {
      return;
    }
    categories = givenCategories;
  }

  if (req.body.locale || req.body.locale == "") {
    if (locale != "same" && !checkLocale(res, req.body.locale)) {
      return;
    }
    locale = req.body.locale;
  }

  if (locale == "same" && categories[0] == "same") { //keep articles in same locale and category
    for (let country in json) {
      for (let category in json[country]["news"]["categories"]) {
        for (let i = 0; i < json[country]["news"]["categories"][category].length; i++) {
          json[country]["news"]["categories"][category][i].title = title;
          json[country]["news"]["categories"][category][i].description = description;
          json[country]["news"]["categories"][category][i].keywords = keywords;
          json[country]["news"]["categories"][category][i].snippet = snippet;
          json[country]["news"]["categories"][category][i].url = url;
          json[country]["news"]["categories"][category][i].image_url = image_url;
          json[country]["news"]["categories"][category][i].language = language;
          json[country]["news"]["categories"][category][i].published_at = published_at;
          json[country]["news"]["categories"][category][i].source = source;
        }
      }
    }
  } else if (locale == "same") { //keep articles in same locale and move to specified categories
    for (let country in json) {
      let newJson = createNewsCategoriesObj();
      for (let i = 0; i < categories.length; i++) {
        for (let category in json[country]["news"]["categories"]) {
          for (let j = 0; j < json[country]["news"]["categories"][category].length; j++) {
            let article = {
              uuid: json[country]["news"]["categories"][category][j].uuid,
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
              relevance_score: null,
              locale: country
            };
            newJson[categories[i]].push(article);
          }
        }
      }
      json[country]["news"]["categories"] = newJson;
    }
  } else if (categories[0] == "same") { //keep articles in same category and move to one locale
    for (let country in json) {
      for (let category in json[country]["news"]["categories"]) {
        for (let i = 0; i < json[country]["news"]["categories"][category].length; i++) {
          if (country == locale) { //update article in new locale with new data
            json[locale]["news"]["categories"][category][i].title = title;
            json[locale]["news"]["categories"][category][i].description = description;
            json[locale]["news"]["categories"][category][i].keywords = keywords;
            json[locale]["news"]["categories"][category][i].snippet = snippet;
            json[locale]["news"]["categories"][category][i].url = url;
            json[locale]["news"]["categories"][category][i].image_url = image_url;
            json[locale]["news"]["categories"][category][i].language = language;
            json[locale]["news"]["categories"][category][i].published_at = published_at;
            json[locale]["news"]["categories"][category][i].source = source;
            json[locale]["news"]["categories"][category][i].locale = locale;
          } else { //remake article from other locale and put into new locale
            let article = {
              uuid: json[country]["news"]["categories"][category][i].uuid,
              title: title,
              description: description,
              keywords: keywords,
              snippet: snippet,
              url: url,
              image_url: image_url,
              language: language,
              published_at: published_at,
              source: source,
              categories: json[country]["news"]["categories"][category][i].categories,
              relevance_score: null,
              locale: locale
            };
            json[locale]["news"]["categories"][category].push(article);
          }
        }
      }
      if (country != locale) {
        json[country]["news"]["categories"] = createNewsCategoriesObj();
      }
    }
  } else { //move all articles to one locale and specified categories
    let newJson = createNewsCategoriesObj();
    for (let country in json) {
      for (let i = 0; i < categories.length; i++) {
        for (let category in json[country]["news"]["categories"]) {
          for (let j = 0; j < json[country]["news"]["categories"][category].length; j++) {
            let article = {
              uuid: json[country]["news"]["categories"][category][j].uuid,
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
              relevance_score: null,
              locale: locale
            };
            newJson[categories[i]].push(article);
          }
        }
      }
      json[country]["news"]["categories"] = createNewsCategoriesObj();
    }
    json[locale]["news"]["categories"] = newJson;
  }

  if (!(locale != "same" && categories[0] != "same")) { //no uuids in new places -> no need to sort
    for (let country in json) {
      for (let category in json[country]["news"]["categories"]) {
        sortArticles(json, country, category);
      }
    }
  }
  updateJsonFile(json);

  res.json({
    message: 'Update successful'
  });
});

router.put('/*', (req, res) => {
  // Defaults
  let title = "";
  let description = "";
  let keywords = "";
  let snippet = "";
  let url = "#";
  let image_url = "#";
  let language = "en";
  let published_at = getLatestDay();
  let source = "#";
  let categories = ["same"];
  let locale = "same";
  let old_locale = "us";
  let old_categories = ["general"];

  // Error checking
  if (!checkParameters(res, Object.keys(req.body), ["title", "description", "keywords", "snippet", "url", "image_url", "language", "published_at", "source", "categories", "locale", "old_locale", "old_categories"])) {
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
    if (!checkUrl(res, req.body.url)) {
      return;
    }
    url = req.body.url;
  }
  
  if (req.body.image_url || req.body.image_url == "") {
    if (!checkImageUrl(res, req.body.image_url)) {
      return;
    }
    url = req.body.image_url;
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
    if (givenCategories.includes("same") && givenCategories.length != 1) {
      res.status(400).json({
        error: 'If using \'same\' category, can\'t use any other category'
      });
      return;
    }

    let validCategories = CATEGORIES.slice();
    validCategories.push("same");
    if (!checkCategories(res, givenCategories, validCategories)) {
      return;
    }
    categories = givenCategories;
  }

  if (req.body.locale || req.body.locale == "") {
    if (req.body.locale != "same" && !checkLocale(res, req.body.locale)) {
      return;
    }
    locale = req.body.locale;
  }

  if (req.body.old_locale || req.body.old_locale == "") {
    if (!checkLocale(res, req.body.old_locale)) {
      return;
    }
    old_locale = req.body.old_locale;
  }

  if (req.body.old_categories || req.body.old_categories == "") {
    let givenCategories = req.body.old_categories.split(",");
    if (!checkCategories(res, givenCategories, CATEGORIES)) {
      return;
    }
    old_categories = givenCategories;
  }

  let path = req.path.split("/");
  let uuid = path[path.length-1];
  let indices = []; //indices found in order of old_categories
  for (let i = 0; i < old_categories.length; i++) { //make sure article is found in all given old categories
    let ind = findArticle(json, old_locale, old_categories[i], uuid);
    if (ind == -1) {
      res.status(404).json({
        error: 'uuid \'' + uuid + '\' in \'' + old_locale + ' ' + old_categories[i] + '\' not found'
      });
      return;
    }
    indices.push(ind);
  }

  let article = {
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
    categories: json[old_locale]["news"]["categories"][old_categories[0]][indices[0]].categories, //categories should be same for article in all places
    relevance_score: null,
    locale: old_locale
  };
  if (locale != "same") {
    article.locale = locale;
  }
  if (categories[0] != "same") {
    article.categories = categories;
  }

  if (locale == "same" && categories[0] == "same") { //keep article in same locale and category
    for (let i = 0; i < indices.length; i++) {
      json[old_locale]["news"]["categories"][old_categories[i]][indices[i]] = article;
    }
  } else {
    for (let i = 0; i < old_categories.length; i++) { //remove old articles
      let ind = indices[i];
      while (ind != -1) { //removing any dupes
        json[old_locale]["news"]["categories"][old_categories[i]].splice(ind,1);
        ind = findArticle(json, old_locale, old_categories[i], uuid);
      }
    }

    if (locale == "same") { //keep article in same locale and move to new categories
      for (let i = 0; i < categories.length; i++) {
        json[old_locale]["news"]["categories"][categories[i]].push(article);
        sortArticles(json, old_locale, categories[i]);
      }
    } else if (categories[0] == "same") { //keep article in same categories and move to new locale
      for (let i = 0; i < old_categories.length; i++) {
        json[locale]["news"]["categories"][old_categories[i]].push(article);
        sortArticles(json, locale, old_categories[i]);
      }
    } else { //move article to new locale and categories
      for (let i = 0; i < categories.length; i++) {
        json[locale]["news"]["categories"][categories[i]].push(article);
        sortArticles(json, locale, categories[i]);
      }
    }
  }
  updateJsonFile(json);

  res.json({
    uuid: uuid,
    locale: locale,
    categories: categories,
    article: article
  });
});

router.delete('/*', (req, res) => {
  let affected_categories = [];

  // Default
  let locale = "us";
  let categories = CATEGORIES;

  // Error checking
  if (!checkParameters(res, Object.keys(req.body), ["locale", "categories"])) {
    return;
  }

  if (req.body.locale || req.body.locale == "") {
    if (!checkLocale(res, req.body.locale)) {
      return;
    }
    locale = req.body.locale;
  }

  if (req.body.categories || req.body.categories == "") {
    let givenCategories = req.body.categories.split(",");
    if (givenCategories.includes("all") && givenCategories.length != 1) {
      res.status(400).json({
        error: 'If using \'all\' category, can\'t use any other category'
      });
      return;
    }

    let validCategories = CATEGORIES.slice();
    validCategories.push("all");
    if (!checkCategories(res, givenCategories, validCategories)) {
      return;
    }
    if (givenCategories[0] != "all") {
      categories = givenCategories;
    }
  }

  console.log("given");
  console.log(req.body.locale);
  console.log(req.body.categories);
  console.log();
  console.log("set to");
  console.log(locale);
  console.log(categories);

  let path = req.path.split("/");
  let uuid = path[path.length-1];

  for (let i = 0; i < categories.length; i++) {
    let ind = findArticle(json, locale, categories[i], uuid);
    if (ind != -1) {
      affected_categories.push(categories[i]);
    }
    while (ind != -1) { //removing any dupes
      json[locale]["news"]["categories"][categories[i]].splice(ind,1);
      ind = findArticle(json, locale, categories[i], uuid);
    }
  }
  updateJsonFile(json);

  let affected_locale = "";
  if (affected_categories.length > 0) {
    affected_locale = locale;
  }

  res.json({
    affected_locale: affected_locale,
    affected_categories: affected_categories
  });
});

module.exports = router;