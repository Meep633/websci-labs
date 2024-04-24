const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkParameters = err_check.checkParameters;
  const checkLocale = err_check.checkLocale;

const update = require('../modules/update');
  const updateCountryDetails = update.updateCountryDetails;


let json = require('../data.json');

router.get('/', (req, res) => {
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
    let x = await updateCountryDetails(res, json, [locale], true);
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

module.exports = router;