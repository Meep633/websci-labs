const mongo_models = require('./mongo_models');
  const NBAStatsModel = mongo_models.NBAStatsModel;

async function balldontlieLoad(doc, name) {
  let minArr = doc.min.split(":"); //min:sec
  let min = parseInt(minArr[0]) + (parseInt(minArr[1]) / 60);

  try {
    const result = await NBAStatsModel.create({
      name: name,
      season: doc.season,
      games_played: doc.games_played,
      mpg: min,
      ppg: doc.pts,
      apg: doc.ast,
      trpg: doc.reb,
      drpg: doc.dreb,
      orpg: doc.oreb,
      bpg: doc.blk,
      spg: doc.stl,
      tpg: doc.turnover,
      fgm: doc.fgm,
      fga: doc.fga,
      fg_pct: doc.fg_pct,
      '3pm': doc.fg3m,
      '3pa': doc.fg3a,
      '3pt_pct': doc.fg3_pct,
      ftm: doc.ftm,
      fta: doc.fta,
      ft_pct: doc.ft_pct
    });
    return result;
  } catch (e) {
    return {
      error: e.message
    };
  }
}

async function herokuLoad(doc) {
  try {
    const result = await NBAStatsModel.create({
      name: doc.player_name,
      season: doc.season,
      games_played: doc.games,
      mpg: doc.minutes_played / doc.games,
      ppg: doc.PTS / doc.games,
      apg: doc.AST / doc.games,
      trpg: doc.TRB / doc.games,
      drpg: doc.DRB / doc.games,
      orpg: doc.ORB / doc.games,
      bpg: doc.BLK / doc.games,
      spg: doc.STL / doc.games,
      tpg: doc.TOV / doc.games,
      fgm: doc.field_goals / doc.games,
      fga: doc.field_attempts / doc.games,
      fg_pct: doc.field_percent,
      '3pm': doc.three_fg / doc.games,
      '3pa': doc.three_attempts / doc.games,
      '3pt_pct': doc.three_percent,
      ftm: doc.ft / doc.games,
      fta: doc.fta / doc.games,
      ft_pct: doc.ft_percent
    });
    return result;
  } catch (e) {
    return {
      error: e.message
    };
  }
}

async function nbaStatsLoad(doc, season) {
  try {
    const result = await NBAStatsModel.create({
      name: doc[2],
      season: season,
      games_played: doc[5],
      mpg: doc[6],
      ppg: doc[23],
      apg: doc[19],
      trpg: doc[18],
      drpg: doc[17],
      orpg: doc[16],
      bpg: doc[21],
      spg: doc[20],
      tpg: doc[22],
      fgm: doc[7],
      fga: doc[8],
      fg_pct: doc[9],
      '3pm': doc[10],
      '3pa': doc[11],
      '3pt_pct': doc[12],
      ftm: doc[13],
      fta: doc[14],
      ft_pct: doc[15]
    });
    return result;
  } catch (e) {
    return {
      error: e.message
    };
  }
}

//extraInfo is needed for nbaStatsLoad and balldontlieLoad 
//(they dont come with name and/or season but that data is used to get the data from those apis)
async function load(doc, src, extraInfo = {}) {
  if (src == "balldontlie") {
    return await balldontlieLoad(doc, extraInfo.name);
  } else if (src == "heroku") {
    return await herokuLoad(doc);
  } else {
    return await nbaStatsLoad(doc, extraInfo.season);
  }
}

module.exports = {
  load
};