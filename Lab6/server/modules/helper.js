const fs = require('fs');

const values = require('./values');
  const CATEGORIES = values.CATEGORIES;

//write to data.json (note: where the json file is written is relative to where this function is called)
function updateJsonFile(json) {
  fs.writeFile("data.json", JSON.stringify(json, null, 2), function writeJSON(err) {
    if (err) {
      console.log(err);
    }
    console.log("updated json");
  });
}

//sort a category's articles by uuid
function sortArticles(json, country, category) {
  json[country]["news"]["categories"][category].sort((a, b) => a.uuid.localeCompare(b.uuid));
}

//find article with uuid in a category (using binary search)
//return index number of article, or if no article is found, return -1
function findArticle(json, country, category, uuid) {
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

module.exports = {
  updateJsonFile,
  sortArticles,
  findArticle,
  validURL,
  createNewsCategoriesObj,
  timeout,
  getLatestDay,
  getLatestWeekday
};