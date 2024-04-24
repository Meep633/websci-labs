const values = require('./values');
  const LANGUAGES = values.LANGUAGES;
  const LOCALES = values.LOCALES;
  const DAYS = values.DAYS;

const helper = require('./helper');
  const validURL = helper.validURL;

const db_functions = require('./db_functions');
  const getNBAPlayers = db_functions.getNBAPlayers;

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

async function checkNBAName(res, givenName) {
  if (!givenName || givenName.split(" ").length < 2) {
    res.status(400).json({
      error: 'Invalid name \'' + givenName + '\'. Name must be a non-empty string and a full name'
    });
    return false;
  }
  const players = await getNBAPlayers();
  for (let i = 0; i < players.length; i++) {
    if (players[i].toLowerCase() == givenName.toLowerCase()) {
      res.status(400).json({
        error: 'NBA player with name \'' + givenName + '\' already exists in database'
      });
      return false;
    }
  }
  return true;
}

function checkNBASeason(res, givenSeason) {
  let season = parseInt(givenSeason);
  if (!season || season < 1940 || season > 2024) {
    res.status(400).json({
      error: 'Invalid season \'' + givenSeason + '\'. All seasons must be an int between 1940 and 2024'
    });
    return false;
  }
  return true;
}

function checkNBAGames(res, givenGames) {
  if (!parseInt(givenGames) || givenGames < 0 || givenGames > 82) {
    res.status(400).json({
      error: 'Invalid games_played \'' + givenGames + '\'. Must be an int between 0 and 82'
    });
    return false;
  }
  return true;
}

function checkNBAStat(res, givenStat, statName) {
  if (!parseFloat(givenStat)) {
    res.status(400).json({
      error: 'Invalid ' + statName + ' \'' + givenStat + '\'. Must be a float'
    });
    return false;
  }
  return true;
}

module.exports = {
  checkParameters,
  checkCategories,
  checkSnippet,
  checkUrl,
  checkImageUrl,
  checkLanguage,
  checkPublished_at,
  checkSource,
  checkLocale,
  checkNBAName,
  checkNBASeason,
  checkNBAGames,
  checkNBAStat
};