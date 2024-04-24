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

async function fetchNBABallDontLie(fullName) {
  let nameArr = fullName.split(" ");
  let firstName = nameArr[0];
  let lastName = "";
  for (let i = 1; i < nameArr.length; i++) { //to account for stuff like Jr.
    lastName += nameArr[1];
  }

  try {
    let response = await axios.get("http://api.balldontlie.io/v1/players", {
      headers: {
        Authorization: process.env.BALLDONTLIE_API_KEY
      },
      params: {
        first_name: firstName,
        last_name: lastName
      }
    });
    
    if (response.data.data.length == 0) { //player not found
      return {
        output: {
          error: "Player '" + fullName + "' not found",
          details: {
            error: "Player '" + fullName + "' not found",
            code: 404
          }
        },
        success: false
      };
    }
    let id = response.data.data[0].id;

    response = await axios.get(`https://api.balldontlie.io/v1/season_averages?player_ids[]=${id}&season=2023`, {
      headers: {
        Authorization: process.env.BALLDONTLIE_API_KEY
      }
    });

    return {
      output: {
        stats: response.data.data[0]
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching nba stats from balldontlie",
        details: {
          error: error.response.data.message,
          code: error.response.data.cod
        }
      },
      success: false
    };
  }
}

async function fetchNBAHeroku(fullName) {
  let name = encodeURIComponent(fullName);

  try {
    let response = await axios.get(`https://nba-stats-db.herokuapp.com/api/playerdata/name/${name}`);
    if (response.data.results.length == 0 || response.data.results[0].season != 2023) {
      return {
        output: {
          error: "Player '" + fullName + "' not found for 2022-23 season",
          details: {
            error: "Player '" + fullName + "' not found for 2022-23 season",
            code: 404
          }
        },
        success: false
      };
    }

    return {
      output: {
        stats: response.data.results[0]
      },
      success: true
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching nba stats from heroku",
        details: {
          error: error.response.data.message,
          code: error.response.data.cod
        }
      },
      success: false
    };
  }
}

async function fetchNBAStats(fullName) {
  try {
    let response = await axios.get('https://stats.nba.com/stats/leagueLeaders?LeagueID=00&PerMode=PerGame&Scope=S&Season=2022-23&SeasonType=Regular+Season&StatCategory=PTS');
    let players = response.data.resultSet.rowSet;
    for (let i = 0; i < players.length; i++) {
      if (players[i][2].toLowerCase() == fullName.toLowerCase()) {
        return {
          output: {
            stats: players[i]
          },
          success: true
        };
      }
    }
    return {
      output: {
        error: "Player '" + fullName + "' not found for 2022-23 season",
        details: {
          error: "Player '" + fullName + "' not found for 2022-23 season",
          code: 404
        }
      },
      success: false
    };
  } catch (error) {
    return {
      output: {
        error: "Internal server error related to fetching nba stats from stats.nba.com",
        details: {
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
  fetchWeather,
  fetchNBABallDontLie,
  fetchNBAHeroku,
  fetchNBAStats
};