const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

let json = require('./data.json');
const PAGE_LIMIT = 50;
const CATEGORIES = ['business', 'entertainment', 'food', 'general', 'health', 'politics', 'science', 'sports', 'tech', 'travel'];
const LANGUAGES = ['ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'multi', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sv', 'ta', 'th', 'tr', 'uk', 'vi', 'zh'];
const LOCALES = ['ar', 'am', 'au', 'at', 'by', 'be', 'bo', 'br', 'bg', 'ca', 'cl', 'cn', 'co', 'hr', 'cz', 'ec', 'eg', 'fr', 'de', 'gr', 'hn', 'hk', 'in', 'id', 'ir', 'ie', 'il', 'it', 'jp', 'kr', 'mx', 'nl', 'nz', 'ni', 'pk', 'pa', 'pe', 'pl', 'pt', 'qa', 'ro', 'ru', 'sa', 'za', 'es', 'ch', 'sy', 'tw', 'th', 'tr', 'ua', 'gb', 'us', 'uy', 've'];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const API_TIMEOUT = 1500; //time to wait between world geodata api calls (in ms)
const NUM_ARTICLES_LIMIT = 50;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //parses stuff passed into request body
app.use(cors({ origin: '*' })); //allow requesters to use response in code

//                                                          error checking functions 

// all functions return true if no errors were found. 
// otherwise, a response with an error is sent and false is returned

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
    res.status(400).json({
      error: 'Invalid locale \'' + givenLocale + '\'. Valid locales: ' + LOCALES
    });
    return false;
  }
  return true;
}

//                                                          helper functions 

//write to news.json
function updateJsonFile() {
  fs.writeFile("./data.json", JSON.stringify(json, null, 2), function writeJSON(err) {
    if (err) {
      console.log(err);
    }
    console.log("updated json");
  });
}

//sort a category's articles by uuid
function sortArticles(country, category) {
  json[country]["news"]["categories"][category].sort((a, b) => a.uuid.localeCompare(b.uuid));
}

//find article with uuid in a category (using binary search)
//return index number of article, or if no article is found, return -1
function findArticle(country, category, uuid) {
  let start = 0;
  let end = json[country]["news"]["categories"][category].length-1;
  while (end >= start) {
    let mid = Math.floor((start+end)/2);
    if (json[country]["news"]["categories"][category][mid].uuid == uuid) {
      return mid;
    } else if (json[country]["news"]["categories"][category][mid].uuid < uuid) {
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

//create a new categories object in json[country][news] ("news": {CATEGORIES[0]: [], ...})
function createNewsCategoriesObj() {
  let obj = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    obj[CATEGORIES[i]] = [];
  }
  return obj;
}

//taken directly from: https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLatestDay() {
  let currDate = new Date();
  let offsetMs = currDate.getTimezoneOffset()*60*1000;
  return new Date(currDate.getTime() - offsetMs).toISOString().split('T')[0];
}

function getLatestWeekday() {
  let currDate = new Date();
  let oneDayMs = 24*60*60*1000;
  let offsetMs = currDate.getTimezoneOffset()*60*1000;
  if (currDate.getDay() == 6) { //saturday
    offsetMs += oneDayMs;
  } else if (currDate.getDay() == 0) { //sunday
    offsetMs += (2*oneDayMs);
  }
  return new Date(currDate.getTime() - offsetMs).toISOString().split('T')[0];
}

//                                                          external api fetches 
          
async function fetchNews(locale, category, limit, page) {
  try {
    let response = await axios.get("https://api.thenewsapi.com/v1/news/top?", {
      params: {
        api_token: 'syYRYmQjrCJOYcuqcuxHNN3fwyd48GMHWFOD1Rwy',
        locale: locale,
        categories: category,
        limit: limit,
        page: page
      }
    });
    if (response.data.data.length == 0) { //error probably?
      return {
        output: {
          error: "Internal server error related to fetching news",
          details: {
            locale: locale,
            categories: category,
            limit: limit,
            page: page,
            error: "No articles received"
          }
        },
        success: false
      };
    }
    return {
      output: {
        articles: response.data.data
      },
      success: true
    };
  } catch (error) {
    //idk what to send here because thenewsapi seemingly never sends an error when given an invalid
    return {
      output: {
        error: "Internal server error related to fetching news",
        details: {
          response: error
        }
      },
      success: false
    };
  }
}

//countryCode = 2 character locale code (look at list of valid locales in api_documentation.md)
async function fetchCountryDetails(countryCode) {
  try {
    let response = await axios.get("https://world-geo-data.p.rapidapi.com/countries/" + countryCode, {
      headers: {
        "X-RapidAPI-Key": "b62cd9774bmsh1119ba432cd991bp199838jsna94a75d48d0b",
        "X-RapidAPI-Host": "world-geo-data.p.rapidapi.com"
      }
    });
    return {
      output: {
        name: response.data.name,
        currency: response.data.currency.code,
        capital_name: response.data.capital.name,
        capital_geonameid: response.data.capital.geonameid,
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching country details",
        details: {
          countryCode: countryCode,
          error: error.response.data.error.message,
          code: error.response.data.error.code
        }
      },
      success: false
    };
  }
}

//geonameid = geonameid of capital of country
async function fetchCapitalCoords(countryCode, geonameid) {
  try {
    let response = await axios.get("https://world-geo-data.p.rapidapi.com/cities/" + geonameid, {
      headers: {
        "X-RapidAPI-Key": "b62cd9774bmsh1119ba432cd991bp199838jsna94a75d48d0b",
        "X-RapidAPI-Host": "world-geo-data.p.rapidapi.com"
      }
    });
    return {
      output: {
        lat: response.data.latitude,
        lon: response.data.longitude
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching country's capital coords",
        details: {
          countryCode: countryCode,
          error: error.response.data.error.message,
          code: error.response.data.error.code
        }
      },
      success: false
    };
  }
}

//currDate = date of latest weekday (no stock data available on weekends)
async function fetchForex(fromCurrency, toCurrency) {
  try {
    let currDate = getLatestWeekday();
    let response = await axios.get("https://alpha-vantage.p.rapidapi.com/query", {
      headers: {
        'X-RapidAPI-Key': 'b62cd9774bmsh1119ba432cd991bp199838jsna94a75d48d0b',
        'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
      },  
      params: {
        function: 'FX_DAILY',
        from_symbol: fromCurrency,
        to_symbol: toCurrency
      }
    });
    if (response.data["Error Message"]) { //for some reason this api always gives a 200 status code
      return {
        output: {
          error: "Internal server error related to fetching forex rates",
          details: {
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            error: response.data["Error Message"]
          }
        },
        success: false
      };
    }
    return {
      output: {
        rate: response.data["Time Series FX (Daily)"][currDate]["1. open"]
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching forex rates",
        details: {
          fromCurrency: fromCurrency,
          toCurrency: toCurrency,
          error: error.data["Error Message"]
        }
      },
      success: false
    };
  }
}

async function fetchWeather(lat, lon) {
  try {
    let response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat: lat,
        lon: lon,
        units: "imperial",
        appid: "12ecb704f1b30dc046f0378170554775" //put this in a .env file not on github if you make this repo public
      }
    });
    return {
      output: {
        weather: response.data.weather[0].main,
        temp: response.data.main.temp + " F"
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching weather",
        details: {
          lat: lat,
          lon: lon,
          error: error.response.data.message,
          code: error.response.data.cod
        }
      },
      success: false
    };
  }
}

//locales = list of countries that may need details to be fetched
//needCoords = if api call for fetching capital coords fails and needCoords is true, output an error. 
//             otherwise don't output an error (useful if you only need to rely on output from fetchCountryDetails)
async function updateCountryDetails(res, locales, needCoords=true) {
  let x = false; //keep track of if an api call was made to avoid unnecessary timeouts

  for (let i = 0; i < locales.length; i++) {
    let locale = locales[i];
    let name = json[locale]["countryDetails"]["name"];
    let currency = json[locale]["countryDetails"]["currency"];
    let capital_name = json[locale]["countryDetails"]["capital_name"];
    let capital_geonameid = json[locale]["countryDetails"]["capital_geonameid"];
    let lat = json[locale]["countryDetails"]["lat"];
    let lon = json[locale]["countryDetails"]["lon"];

    if (!name || !currency || !capital_name || !capital_geonameid) {
      if (x) await timeout(API_TIMEOUT);
      x = true;
      let response = await fetchCountryDetails(locale);
      if (!response.success) {
        res.status(500).json(response.output);
        return false;
      }
      json[locale]["countryDetails"]["name"] = response.output.name;
      json[locale]["countryDetails"]["currency"] = response.output.currency;
      json[locale]["countryDetails"]["capital_name"] = response.output.capital_name;
      json[locale]["countryDetails"]["capital_geonameid"] = response.output.capital_geonameid;
      updateJsonFile();
    }

    if (!lat || !lon) {
      if (x) await timeout(API_TIMEOUT);
      x = true;
      let response = await fetchCapitalCoords(locale, json[locale]["countryDetails"]["capital_geonameid"]);
      if (!response.success && needCoords) {
        res.status(500).json(response.output);
        return false;
      }
      if (response.success) {
        json[locale]["countryDetails"]["lat"] = response.output.lat;
        json[locale]["countryDetails"]["lon"] = response.output.lon;
        updateJsonFile();
      }
    }
  }
  
  return true;
}

//update json data with forex rate from fromLocale's currency to toLocale's currency if not stored data isn't uptodate
async function updateForex(res, fromLocale, toLocale) {
  let currDate = getLatestWeekday();
  let fromCurrency = json[fromLocale]["countryDetails"]["currency"];
  let toCurrency = json[toLocale]["countryDetails"]["currency"];

  if (currDate != json[fromLocale]["finance"][toLocale].last_updated || !json[fromLocale]["finance"][toLocale].rate) {
    let response = await fetchForex(fromCurrency, toCurrency);
    if (!response.success) {
      res.status(500).json(response.output);
      return false;
    }
    json[fromLocale]["finance"][toLocale].rate = response.output.rate;
    json[fromLocale]["finance"][toLocale].last_updated = currDate;
    updateJsonFile();
  }

  return true;
}

//updates stored weather if it's a new hour from when it was stored
async function updateWeather(res, locale) {
  let currDate = getLatestWeekday();
  let currHour = new Date().getHours();
  let lat = json[locale]["countryDetails"]["lat"];
  let lon = json[locale]["countryDetails"]["lon"];

  if (currDate != json[locale]["weather"].last_updated_date || currHour != json[locale]["weather"].last_updated_hour) {
    let response = await fetchWeather(lat, lon);
    if (!response.success) {
      res.status(500).json(response.output);
      return false;
    }
    json[locale]["weather"].weather = response.output.weather;
    json[locale]["weather"].temp = response.output.temp;
    json[locale]["weather"].last_updated_date = currDate;
    json[locale]["weather"].last_updated_hour = currHour;
    updateJsonFile();
  }

  return true;
}

//                                                          lab 2 endpoints

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/news', (req, res) => {
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

app.get('/news/*', (req, res) => {
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

  let ind = findArticle(locale, category, uuid);
  if (ind == -1) {
    res.status(404).json({
      error: 'uuid \'' + uuid + '\' in \'' + locale + ' ' + category + '\' not found'
    });
    return;
  }

  res.json(json[locale]["news"]["categories"][category][ind]);
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
    sortArticles(locale, categories[i]);
  }
  updateJsonFile();

  res.json({
    uuid: uuid,
    locale: locale,
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
        sortArticles(country, category);
      }
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
    let ind = findArticle(old_locale, old_categories[i], uuid);
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
        ind = findArticle(old_locale, old_categories[i], uuid);
      }
    }

    if (locale == "same") { //keep article in same locale and move to new categories
      for (let i = 0; i < categories.length; i++) {
        json[old_locale]["news"]["categories"][categories[i]].push(article);
        sortArticles(old_locale, categories[i]);
      }
    } else if (categories[0] == "same") { //keep article in same categories and move to new locale
      for (let i = 0; i < old_categories.length; i++) {
        json[locale]["news"]["categories"][old_categories[i]].push(article);
        sortArticles(locale, old_categories[i]);
      }
    } else { //move article to new locale and categories
      for (let i = 0; i < categories.length; i++) {
        json[locale]["news"]["categories"][categories[i]].push(article);
        sortArticles(locale, categories[i]);
      }
    }
  }
  updateJsonFile();

  res.json({
    uuid: uuid,
    locale: locale,
    categories: categories,
    article: article
  });
});

app.delete("/news/*", (req, res) => {
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

  let path = req.path.split("/");
  let uuid = path[path.length-1];

  for (let i = 0; i < categories.length; i++) {
    let ind = findArticle(locale, categories[i], uuid);
    if (ind != -1) {
      affected_categories.push(categories[i]);
    }
    while (ind != -1) { //removing any dupes
      json[locale]["news"]["categories"][categories[i]].splice(ind,1);
      ind = findArticle(locale, categories[i], uuid);
    }
  }
  updateJsonFile();

  let affected_locale = "";
  if (affected_categories.length > 0) {
    affected_locale = locale;
  }

  res.json({
    affected_locale: affected_locale,
    affected_categories: affected_categories
  });
});

//                                                          lab 3 endpoints 

app.get("/details", (req, res) => {
  async function getDetails() {
    // Default
    let locale = "us";
    
    // Error checking
    if (!checkParameters(res, Object.keys(req.query), ["locale"])) {
      return;
    }

    if (req.query.locale || req.query.locale == "") {
      if (!checkLocale(res, req.query.locale)) {
        return;
      }
      locale = req.query.locale;
    }

    // Fetching external country details data if needed
    let x = await updateCountryDetails(res, [locale], true);
    if (!x) {
      return;
    }

    res.json({
      name: json[locale]["countryDetails"]["name"],
      currency: json[locale]["countryDetails"]["currency"],
      capital: json[locale]["countryDetails"]["capital"],
      latitude: json[locale]["countryDetails"]["lat"],
      longitude: json[locale]["countryDetails"]["lon"]
    });
  }
  getDetails();
});

app.get("/weather", (req, res) => {
  async function getWeather() {
    // Default
    let locale = "us";

    // Error checking
    if (!checkParameters(res, Object.keys(req.query), ["locale"])) {
      return;
    }

    if (req.query.locale || req.query.locale == "") {
      if (!checkLocale(res, req.query.locale)) {
        return;
      }
      locale = req.query.locale;
    }

    // Fetching external country details data if needed
    let x = await updateCountryDetails(res, [locale], true);
    if (!x) {
      return;
    }
    
    // Fetching external capital weather data if needed
    x = await updateWeather(res, locale);
    if (!x) {
      return;
    }

    res.json({
      weather: json[locale]["weather"].weather,
      temp: json[locale]["weather"].temp
    });
  }
  getWeather();
});

app.get("/forex", (req, res) => {
  // wrapping all this into an async function because i need to potentially wait for external api calls before continuing
  async function getForex() {
    // Defaults
    let from_locale = "us";
    let to_locale = "gb";
    
    // Error checking
    if (!checkParameters(res, Object.keys(req.query), ["from_locale", "to_locale"])) {
      return;
    }

    if (req.query.from_locale || req.query.from_locale == "") {
      if (!checkLocale(res, req.query.from_locale)) {
        return;
      }
      from_locale = req.query.from_locale;
    }
    
    if (req.query.to_locale || req.query.to_locale == "") {
      if (!checkLocale(res, req.query.to_locale)) {
        return;
      }
      to_locale = req.query.to_locale;
    }

    // Fetching external country details data if needed
    let x = await updateCountryDetails(res, [from_locale, to_locale], false);
    if (!x) {
      return;
    }
    
    // Fetching external forex rate data if needed
    x = await updateForex(res, from_locale, to_locale);
    if (!x) {
      return;
    }

    res.json({
      from_currency: json[from_locale]["countryDetails"]["currency"],
      to_currency: json[to_locale]["countryDetails"]["currency"],
      rate: json[from_locale]["finance"][to_locale]["rate"]
    });
  }
  getForex();
});

app.put("/forex", (req, res) => {
  async function putForex() {
    // Defaults
    let from_locale = "us";
    let to_locale = "gb";
    
    // Error checking
    if (!checkParameters(res, Object.keys(req.body), ["from_locale", "to_locale"])) {
      return;
    }

    if (req.body.from_locale || req.body.from_locale == "") {
      if (!checkLocale(res, req.body.from_locale)) {
        return;
      }
      from_locale = req.body.from_locale;
    }
    
    if (req.body.to_locale || req.body.to_locale == "") {
      if (!checkLocale(res, req.body.to_locale)) {
        return;
      }
      to_locale = req.body.to_locale;
    }

    // Fetching external country details data if needed
    let x = await updateCountryDetails(res, [from_locale, to_locale], false);
    if (!x) {
      return;
    }

    // Fetch external forex data and update (pretty much updateForex() except force it to update)
    let currDate = getLatestWeekday();
    let fromCurrency = json[from_locale]["countryDetails"]["currency"];
    let toCurrency = json[to_locale]["countryDetails"]["currency"];
    let response = await fetchForex(fromCurrency, toCurrency);
    if (!response.success) {
      res.status(500).json(response.output);
      return;
    }
    json[from_locale]["finance"][to_locale].rate = response.output.rate;
    json[from_locale]["finance"][to_locale].last_updated = currDate;
    updateJsonFile();

    res.json({
      from_currency: json[from_locale]["countryDetails"]["currency"],
      to_currency: json[to_locale]["countryDetails"]["currency"],
      rate: json[from_locale]["finance"][to_locale]["rate"]
    });
  }
  putForex();
});

app.get("/all_details", (req, res) => {
  async function getAllDetails() {
    // Default
    let from_locale = "us";
    let to_locale = "gb";
    
    // Error checking
    if (!checkParameters(res, Object.keys(req.query), ["from_locale", "to_locale"])) {
      return;
    }

    if (req.query.from_locale || req.query.from_locale == "") {
      if (!checkLocale(res, req.query.from_locale)) {
        return;
      }
      from_locale = req.query.from_locale;
    }

    if (req.query.to_locale || req.query.to_locale == "") {
      if (!checkLocale(res, req.query.to_locale)) {
        return;
      }
      to_locale = req.query.to_locale;
    }

    // Fetching external country details data if needed
    let x = await updateCountryDetails(res, [from_locale, to_locale], true);
    if (!x) {
      return;
    }

    // Fetching external forex rate data if needed
    x = await updateForex(res, from_locale, to_locale);
    if (!x) {
      return;
    }

    // Fetching external capital weather data if needed
    x = await updateWeather(res, from_locale);
    if (!x) {
      return;
    }

    res.send({
      details: {
        name: json[from_locale]["countryDetails"]["name"],
        currency: json[from_locale]["countryDetails"]["currency"],
        capital: json[from_locale]["countryDetails"]["capital"],
        latitude: json[from_locale]["countryDetails"]["lat"],
        longitude: json[from_locale]["countryDetails"]["lon"]
      },
      weather: {
        weather: json[from_locale]["weather"].weather,
        temp: json[from_locale]["weather"].temp
      },
      forex: {
        from_currency: json[from_locale]["countryDetails"]["currency"],
        to_currency: json[to_locale]["countryDetails"]["currency"],
        rate: json[from_locale]["finance"][to_locale]["rate"]
      }
    });
  }
  getAllDetails();
});

app.post("/news/latest", (req, res) => {
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
    console.log(num_articles);
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
        if (findArticle(locale, category, uuid) == -1) { //if article is a duplicate, then it should already be in data.json
          let categories = response.output.articles[i].categories;
          for (let j = 0; j < categories.length; j++) {
            json[locale]["news"]["categories"][categories[j]].push(response.output.articles[i]);
          }
          articles.push(response.output.articles[i]);
        }
      }
      sortArticles(locale, category);
      updateJsonFile();
    }

    res.json({
      articles: articles
    });
  }
  postLatestNews();
});

app.get("/testing", (req, res) => { //how can i make it so that this endpoint cant be called from anywhere else. how do i restrict access to only ./public/index.html?
  // let test = {hi: "hi!!!!"}
  // fs.writeFile("./testWrite.json", JSON.stringify(test, null, 2), function writeJSON(err) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log("updated testWrite");
  // });

  res.send("testing");
});

app.listen(port, () => {
  console.log('Listening on *:' + port);
});