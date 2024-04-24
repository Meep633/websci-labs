const axios = require('axios');

const helper = require('./helper');
  const getLatestWeekday = helper.getLatestWeekday;

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

module.exports = {
  fetchNews,
  fetchCountryDetails,
  fetchCapitalCoords,
  fetchForex,
  fetchWeather
};