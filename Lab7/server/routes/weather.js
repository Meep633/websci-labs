const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkLocale = err_check.checkLocale;

const update = require('../modules/update');
  const updateCountryDetails = update.updateCountryDetails;
  const updateWeather = update.updateWeather;


let json = require('../data.json');

router.get('/', (req, res) => {
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
    let x = await updateCountryDetails(res, json, [locale], true);
    if (!x) {
      return;
    }
    
    // Fetching external capital weather data if needed
    x = await updateWeather(res, json, locale);
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

module.exports = router;