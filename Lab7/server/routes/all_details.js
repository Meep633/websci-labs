const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkLocale = err_check.checkLocale;

const update = require('../modules/update');
  const updateCountryDetails = update.updateCountryDetails;
  const updateForex = update.updateForex;
  const updateWeather = update.updateWeather;


let json = require('../data.json');

router.get('/', (req, res) => {
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
    let x = await updateCountryDetails(res, json, [from_locale, to_locale], true);
    if (!x) {
      return;
    }

    // Fetching external forex rate data if needed
    x = await updateForex(res, json, from_locale, to_locale);
    if (!x) {
      return;
    }

    // Fetching external capital weather data if needed
    x = await updateWeather(res, json, from_locale);
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

module.exports = router;