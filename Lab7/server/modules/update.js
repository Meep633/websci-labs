const fetch = require('./fetch');
  const fetchCountryDetails = fetch.fetchCountryDetails;
  const fetchCapitalCoords = fetch.fetchCapitalCoords;
  const fetchForex = fetch.fetchForex;
  const fetchWeather = fetch.fetchWeather;

const helper = require('./helper');
  const timeout = helper.timeout;
  const updateJsonFile = helper.updateJsonFile;
  const getLatestDay = helper.getLatestDay;
  const getLatestWeekday = helper.getLatestWeekday;

const values = require('./values');
  const API_TIMEOUT = values.API_TIMEOUT;

//locales = list of countries that may need details to be fetched
//needCoords = if api call for fetching capital coords fails and needCoords is true, output an error. 
//             otherwise don't output an error (useful if you only need to rely on output from fetchCountryDetails)
async function updateCountryDetails(res, json, locales, needCoords=true) {
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
      updateJsonFile(json);
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
        updateJsonFile(json);
      }
    }
  }
  
  return true;
}

//update json data with forex rate from fromLocale's currency to toLocale's currency if not stored data isn't uptodate
async function updateForex(res, json, fromLocale, toLocale) {
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
    updateJsonFile(json);
  }

  return true;
}

//updates stored weather if it's a new hour from when it was stored
async function updateWeather(res, json, locale) {
  let currDate = getLatestDay();
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
    updateJsonFile(json);
  }

  return true;
}

module.exports = {
  updateCountryDetails,
  updateForex,
  updateWeather
};