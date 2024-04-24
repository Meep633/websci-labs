const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const fs = require('fs');
var json = require('./news.json'); //not a const because it can be edited
const PAGE_LIMIT = 50;
const CATEGORIES = ['business', 'entertainment', 'food', 'general', 'health', 'politics', 'science', 'sports', 'tech', 'travel'];
const LANGUAGES = ['ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'multi', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh'];
const LOCALES = ['ar', 'am', 'au', 'at', 'by', 'be', 'bo', 'br', 'bg', 'ca', 'cl', 'cn', 'co', 'hr', 'cz', 'ec', 'eg', 'fr', 'de', 'gr', 'hn', 'hk', 'in', 'id', 'ir', 'ie', 'il', 'it', 'jp', 'kr', 'mx', 'nl', 'nz', 'ni', 'pk', 'pa', 'pe', 'pl', 'pt', 'qa', 'ro', 'ru', 'sa', 'za', 'es', 'ch', 'sy', 'tw', 'th', 'tr', 'ua', 'gb', 'us', 'uy', 've'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                                                      /* error checking functions */

// all functions return true if no errors were found. otherwise, a response with an error is sent and false is returned

function checkParameters(res, givenParameters, validParameters) {
  for (let i = 0; i < givenParameters.length; i++) {
    if (!validParameters.includes(givenParameters[i])) {
      res.status(400).json({
        error: 'Invalid parameter \'' + givenParameters[i] + '\'. Valid parameters: ' + validParameters
      });
      return false;
    }
  }
  return true;
}

function checkCategories(res, givenCategories, validCategories) {
  for (let i = 0; i < givenCategories.length; i++) {
    if (!validCategories.includes(givenCategories[i])) {
      res.status(400).json({
        error: 'Invalid category \'' + givenCategories[i] + '\'. Valid categories: ' + validCategories
      });
      return false;
    }
  }
  return true;
}

function checkSnippet(res, givenSnippet) {
  let words = givenSnippet.split(" ");
  if (words.length > 60) {
    res.status(400).json({
      error: 'Snippet length too long. Snippets must be <= 60 words'
    });
    return false;
  }
  return true;
}

function checkUrl(res, givenUrl) {
  if (!validURL(givenUrl)) {
    res.status(400).json({
      error: 'Invalid url given (\'' + givenUrl +'\')'
    });
    return false;
  }
  return true;
}

function checkImageUrl(res, givenImage_url) {
  if (!validURL(givenImage_url)) {
    res.status(400).json({
      error: 'Invalid image_url given (\'' + givenImage_url +'\')'
    });
    return false;
  }
  return true;
}

function checkLanguage(res, givenLanguage) {
  if (!LANGUAGES.includes(givenLanguage)) {
    res.status(400).json({
      error: 'Invalid language \'' + givenLanguage + '\'. Valid languages: ' + LANGUAGES
    });
    return false;
  }
  return true;
}

function checkPublished_at(res, givenPublished_at) {
  let givenDate = givenPublished_at.split("-");
  if (givenDate.length != 3) {
    res.status(400).json({
      error: 'Invalid date \'' + givenPublished_at +'\'. Date must be in format YYYY-MM-DD'
    });
    return false;
  }

  let year = parseInt(givenDate[0]);
  let currentYear = new Date().getFullYear();
  if (!year || year < 0 || year > currentYear) {
    res.status(400).json({
      error: 'Invalid year \'' + year + '\'. Valid year: 0 <= year <= ' + currentYear
    });
    return false;
  }

  let month = parseInt(givenDate[1]);
  if (!month || month < 1 || month > 12) {
    res.status(400).json({
      error: 'Invalid month \'' + month + '\'. Valid month: 1 <= month <= 12'
    });
    return false;
  }
  
  let day = parseInt(givenDate[2]);
  let leapYear = (year % 100 == 0 && year % 400 == 0) || (year % 100 != 0 && year % 4 == 0)
  if (!day || day < 1 || (month != 2 && day > DAYS[month-1])) {
    res.status(400).json({
      error: 'Invalid date \'' + givenPublished_at + '\''
    });
    return false;
  } else if ((leapYear && month == 2 && day > 29) || (!leapYear && day > DAYS[day])) { //leap year check
    res.status(400).json({
      error: 'Invalid date \'' + givenPublished_at + '\''
    });
    return false;
  }
  return true;
}

function checkSource(res, givenSource) {
  if (!validURL(givenSource)) {
    res.status(400).json({
      error: 'Invalid source given (\'' + givenSource +'\')'
    });
    return false;
  }
  return true;
}

function checkLocale(res, givenLocale) {
  if (!LOCALES.includes(givenLocale)) {
    res.json({
      error: 'Invalid locale \'' + givenLocale + '\'. Valid locales: ' + LOCALES
    });
    return false;
  }
  return true;
}

                                                          /* helper functions */
//write to news.json
function updateJsonFile() {
  fs.writeFile("./news.json", JSON.stringify(json, null, 2), function writeJSON(err) {
    if (err) {
      console.log(err);
    }
    console.log("updated json");
  });
}

//sort a category's articles by uuid
function sortArticles(category) {
  json[category].sort((a, b) => a.uuid.localeCompare(b.uuid));
}

//find article with uuid in a category (using binary search)
//return index number of article, or if no article is found, return -1
function findArticle(category, uuid) {
  let start = 0;
  let end = json[category].length-1;
  while (end >= start) {
    let mid = Math.floor((start+end)/2);
    if (json[category][mid].uuid == uuid) {
      return mid;
    } else if (json[category][mid].uuid < uuid) {
      start = mid+1;
    } else {
      end = mid-1;
    }
  }
  return -1; //no article found
}

//check to see if url is valid
//taken directly from: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

                                                              /* endpoints */
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parses stuff passed into request body
app.use(cors({ origin: '*' }));

app.get('/news', (req, res) => {
  // Defaults
  let page = 1;
  let category = "general";
  let limit = 20;

  // Error checking
  if (!checkParameters(res, Object.keys(req.query), ["page", "category", "limit"])) {
    return;
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

    let pageLimit = Math.ceil(json[category].length / limit); //rounding up because last page can have < limit pages
    if (req.query.page < 1 || (req.query.page != 1 && req.query.page > pageLimit)) { //page 1 should always be valid even if there are no articles in a category
      pageLimit = Math.max(pageLimit, 1); //if pageLimit = 0, I don't want to tell the client that a valid page is 1 <= page <= 0
      res.status(400).json({
        error: 'Invalid page \'' + req.query.page + '\'. Given category \'' + category + '\' and limit ' + limit + ', a valid page is: 1 <= page <= ' + pageLimit
      });
      return;
    }
    page = req.query.page;
  }

  let retJson = [];
  //(page-1)*limit = first entry on page, page*limit = first entry on next page
  for (let i = (page-1)*limit; i < page*limit && i < json[category].length; i++) {
    retJson.push(json[category][i]);
  }
  res.json(retJson);
});

app.get('/news/*', (req, res) => {
  // Default
  let category = "general";
  
  // Error checking
  if (!checkParameters(res, Object.keys(req.query), ["category"])) {
    return;
  }

  if (req.query.category || req.query.category == "") {
    if (!checkCategories(res, [req.query.category], CATEGORIES)) {
      return;
    }
    category = req.query.category;
  }

  let path = req.path.split("/");
  let uuid = path[path.length-1];

  let ind = findArticle(category, uuid);
  if (ind == -1) {
    res.status(404).json({
      error: 'uuid \'' + uuid + '\' in \'' + category + '\' not found'
    });
    return;
  }

  res.json(json[category][ind]);
});

app.post('/news', (req, res) => {
  let date = new Date();

  // Defaults
  let title = "";
  let description = "";
  let keywords = "";
  let snippet = "";
  let url = "#";
  let image_url = "#";
  let language = "en";
  let published_at = "" + date.getFullYear() + "-";
  if (date.getMonth() < 10) {
    published_at += "0";
  }
  published_at += date.getMonth() + "-";
  if (date.getDay() < 10) {
    published_at += "0";
  }
  published_at += date.getDay();
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

  // make an article object and append it to the categories given
  let uuid = json[categories[0]].length + "-" + categories[0];
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
    json[categories[i]].push(article);
    sortArticles(categories[i]);
  }
  updateJsonFile();

  res.json({
    uuid: uuid,
    categories: categories,
    article: article
  });
});

app.put("/news", (req, res) => {
  let date = new Date();

  // Defaults
  let title = "";
  let description = "";
  let keywords = "";
  let snippet = "";
  let url = "#";
  let image_url = "#";
  let language = "en";
  let published_at = "" + date.getFullYear() + "-";
  if (date.getMonth() < 10) {
    published_at += "0";
  }
  published_at += date.getMonth() + "-";
  if (date.getDay() < 10) {
    published_at += "0";
  }
  published_at += date.getDay();
  let source = "#";
  let categories = ["same"];
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
    if (!checkLocale(res, req.body.locale)) {
      return;
    }
    locale = req.body.locale;
  }

  //go through every article, get the uuid, and update it. then write over news.json and return a success message
  if (categories[0] == "same") {
    for (let category in json) {
      for (let i = 0; i < json[category].length; i++) {
        json[category][i].title = title;
        json[category][i].description = description;
        json[category][i].keywords = keywords;
        json[category][i].snippet = snippet;
        json[category][i].url = url;
        json[category][i].image_url = image_url;
        json[category][i].language = language;
        json[category][i].published_at = published_at;
        json[category][i].source = source;
        json[category][i].locale = locale;
      }
    }
  } else {
    let newJson = {
      "business": [],
      "entertainment": [],
      "food": [],
      "general": [],
      "health": [],
      "politics": [],
      "science": [],
      "sports": [],
      "tech": [],
      "travel": []
    };
    for (let i = 0; i < categories.length; i++) {
      for (let category in json) {
        for (let j = 0; j < json[category].length; j++) {
          let article = {
            uuid: json[category][j].uuid,
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
    json = newJson;
    for (let i = 0; i < categories.length; i++) { //sort newly placed articles
      sortArticles(categories[i]);
    }
  }
  updateJsonFile();

  res.json({
    message: 'Update successful'
  });
});

app.put("/news/*", (req, res) => {
  let date = new Date();

  // Defaults
  let title = "";
  let description = "";
  let keywords = "";
  let snippet = "";
  let url = "#";
  let image_url = "#";
  let language = "en";
  let published_at = "" + date.getFullYear() + "-";
  if (date.getMonth() < 10) {
    published_at += "0";
  }
  published_at += date.getMonth() + "-";
  if (date.getDay() < 10) {
    published_at += "0";
  }
  published_at += date.getDay();
  let source = "#";
  let categories = ["same"];
  let locale = "us";
  let old_categories = ["general"];

  // Error checking
  if (!checkParameters(res, Object.keys(req.body), ["title", "description", "keywords", "snippet", "url", "image_url", "language", "published_at", "source", "categories", "locale", "old_categories"])) {
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
    if (!checkLocale(res, req.body.locale)) {
      return;
    }
    locale = req.body.locale;
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
    let ind = findArticle(old_categories[i], uuid);
    if (ind == -1) {
      res.status(404).json({
        error: 'uuid \'' + uuid + '\' in \'' + old_categories[i] + '\' not found'
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
    categories: json[old_categories[0]][indices[0]].categories, //categories should be same for article in all places
    relevance_score: null,
    locale: locale
  };

  if (categories[0] == "same") {
    for (let i = 0; i < indices.length; i++) { //update article and keep in same category
      json[old_categories[i]][indices[i]] = article;
    }
  } else { //update article and move categories
    article.categories = categories;
    for (let i = 0; i < old_categories.length; i++) { //remove from old categories
      let ind = indices[i];
      while (ind != -1) { //removing any dupes
        json[old_categories[i]].splice(ind,1);
        ind = findArticle(old_categories[i], uuid);
      }
    }
    for (let i = 0; i < categories.length; i++) { //add to new categories
      json[categories[i]].push(article);
      sortArticles(categories[i]);
    }
  }
  updateJsonFile();

  res.json({
    uuid: uuid,
    categories: categories,
    article: article
  });
});

app.delete("/news/*", (req, res) => {
  let affected_categories = [];

  // Default
  let categories = ["general"];

  // Error checking
  if (!checkParameters(res, Object.keys(req.body), ["categories"])) {
    return;
  }

  if (req.body.categories || req.body.categories == "") {
    let givenCategories = req.body.categories.split(",");
    if (!checkCategories(res, givenCategories, CATEGORIES)) {
      return;
    }
    categories = givenCategories;
  }

  let path = req.path.split("/");
  let uuid = path[path.length-1];

  for (let i = 0; i < categories.length; i++) {
    let ind = findArticle(categories[i], uuid);
    if (ind != -1) {
      affected_categories.push(categories[i]);
    }
    while (ind != -1) { //removing any dupes
      json[categories[i]].splice(ind,1);
      ind = findArticle(categories[i], uuid);
    }
  }
  updateJsonFile();

  res.json({
    affected_categories: affected_categories
  });
});

app.listen(port, () => {
	console.log('Listening on *:' + port);
});