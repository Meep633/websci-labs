const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkLocale = err_check.checkLocale;

const fetch = require('../modules/fetch');
  const fetchForex = fetch.fetchForex;

const helper = require('../modules/helper');
  const updateJsonFile = helper.updateJsonFile;
  const getLatestWeekday = helper.getLatestWeekday;

const update = require('../modules/update');
  const updateCountryDetails = update.updateCountryDetails;
  const updateForex = update.updateForex;


let json = require('../data.json');

router.get('/', (req, res) => {
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
    let x = await updateCountryDetails(res, json, [from_locale, to_locale], false);
    if (!x) {
      return;
    }
    
    // Fetching external forex rate data if needed
    x = await updateForex(res, json, from_locale, to_locale);
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

router.put('/', (req, res) => {
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
    let x = await updateCountryDetails(res, json, [from_locale, to_locale], false);
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
    updateJsonFile(json);

    res.json({
      from_currency: json[from_locale]["countryDetails"]["currency"],
      to_currency: json[to_locale]["countryDetails"]["currency"],
      rate: json[from_locale]["finance"][to_locale]["rate"]
    });
  }
  putForex();
});

module.exports = router;