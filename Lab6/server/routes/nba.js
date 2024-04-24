const express = require('express');
const router = express.Router();

const err_check = require('../modules/err_check');
  const checkNBAName = err_check.checkNBAName;
  const checkNBASeason = err_check.checkNBASeason;
  const checkNBAGames = err_check.checkNBAGames;
  const checkNBAStat = err_check.checkNBAStat;
const fetch = require('../modules/fetch');
  const fetchNBABallDontLie = fetch.fetchNBABallDontLie;
  const fetchNBAHeroku = fetch.fetchNBAHeroku;
  const fetchNBAStats = fetch.fetchNBAStats;
const db_functions = require('../modules/db_functions');
  const connect = db_functions.connect;
  const disconnect = db_functions.disconnect;
  const getNBAPlayers = db_functions.getNBAPlayers;
const mongo_models = require('../modules/mongo_models');
  const NBAStatsModel = mongo_models.NBAStatsModel;
const nba_etl = require('../modules/nba_etl');
  const load = nba_etl.load;

router.get('/', (req, res) => {
  const getNBA = async () => {
    const players = await getNBAPlayers();
    let output = [];
    for (let i = 0; i < players.length; i++) {
      output.push("/nba/" + encodeURIComponent(players[i]));
    }
    res.send(output);
  }

  const func = async () => {
    await connect();
    await getNBA();
    await disconnect();
  }
  func();
});

router.get('/:player', (req, res) => {
  const getPlayer = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");

    const players = await getNBAPlayers();
    if (!players.includes(name)) {
      res.status(404).json({
        error: "Player not found. Valid players: " + players
      });
      return;
    }
    
    const player = await NBAStatsModel.findOne({name: name});
    res.status(200).json(player);
  };

  const func = async () => {
    await connect();
    await getPlayer();
    await disconnect();
  };
  func();
});

router.get('/balldontlie/:player', (req, res) => {
  const loadBallDontLie = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");
    if (!(await checkNBAName(res, name))) {
      return;
    }

    let fetchResult = await fetchNBABallDontLie(name);
    if (!fetchResult.success) {
      res.status(fetchResult.output.details.code).json(fetchResult.output);
    }
    let loadResult = await load(fetchResult.output.stats, "balldontlie", {name: name});
    if (loadResult.error) {
      res.status(500).json(loadResult);
      return;
    }
    res.status(201).json(loadResult);
  };

  const func = async () => {
    await connect();
    await loadBallDontLie();
    await disconnect();
  }
  func();
});

router.get('/heroku/:player', (req, res) => {
  const loadHeroku = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");
    if (!(await checkNBAName(res, name))) {
      return;
    }

    let fetchResult = await fetchNBAHeroku(name);
    if (!fetchResult.success) {
      res.status(fetchResult.output.details.code).json(fetchResult.output);
      return;
    }
    if ((await getNBAPlayers()).includes(fetchResult.output.stats.player_name)) {
      res.status(400).json({
        error: 'Database already contains player \'' + fetchResult.output.stats.player_name + '\''
      });
      return;
    }
    let loadResult = await load(fetchResult.output.stats, "heroku");
    if (loadResult.error) {
      res.status(500).json(loadResult);
      return;
    }
    res.status(201).json(loadResult);
  };

  const func = async () => {
    await connect();
    await loadHeroku();
    await disconnect();
  }
  func();
});

router.get('/stats.nba.com/:player', (req, res) => {
  const loadNBAStats = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");
    if (!(await checkNBAName(res, name))) {
      return;
    }

    let fetchResult = await fetchNBAStats(name);
    if (!fetchResult.success) {
      res.status(fetchResult.output.details.code).json(fetchResult.output);
      return;
    }

    let loadResult = await load(fetchResult.output.stats, "nbastats", {season: 2023});
    if (loadResult.error) {
      res.status(500).json(loadResult);
      return;
    }
    res.status(201).json(loadResult);
  };

  const func = async () => {
    await connect();
    await loadNBAStats();
    await disconnect();
  }
  func();
});

router.post('/', (req, res) => {
  const postPlayer = async () => {
    let name = req.body.name;
    if (!(await checkNBAName(res, name))) return;
    let season = parseInt(req.body.season);
    if (!checkNBASeason(res, season)) return;
    let games_played = parseInt(req.body.games_played);
    if (!checkNBAGames(res, games_played)) return;
    let mpg = parseFloat(req.body.mpg);
    if (!checkNBAStat(res, mpg, "mpg")) return;
    let ppg = parseFloat(req.body.ppg);
    if (!checkNBAStat(res, ppg, "ppg")) return;
    let apg = parseFloat(req.body.apg);
    if (!checkNBAStat(res, apg, "apg")) return;
    let trpg = parseFloat(req.body.trpg);
    if (!checkNBAStat(res, trpg, "trpg")) return;
    let drpg = parseFloat(req.body.drpg);
    if (!checkNBAStat(res, drpg, "drpg")) return;
    let orpg = parseFloat(req.body.orpg);
    if (!checkNBAStat(res, orpg, "orpg")) return;
    let bpg = parseFloat(req.body.bpg);
    if (!checkNBAStat(res, bpg, "bpg")) return;
    let spg = parseFloat(req.body.spg);
    if (!checkNBAStat(res, spg, "spg")) return;
    let tpg = parseFloat(req.body.tpg);
    if (!checkNBAStat(res, tpg, "tpg")) return;
    let fgm = parseFloat(req.body.fgm);
    if (!checkNBAStat(res, fgm, "fgm")) return;
    let fga = parseFloat(req.body.fga);
    if (!checkNBAStat(res, fga, "fga")) return;
    let fg_pct = parseFloat(req.body.fg_pct);
    if (!checkNBAStat(res, fg_pct, "fg_pct")) return;
    let fg3pm = parseFloat(req.body.fg3pm);
    if (!checkNBAStat(res, fg3pm, "fg3pm")) return;
    let fg3pa = parseFloat(req.body.fg3pa);
    if (!checkNBAStat(res, fg3pa, "fg3pa")) return;
    let fg3_pct = parseFloat(req.body.fg3_pct);
    if (!checkNBAStat(res, fg3_pct, "fg3_pct")) return;
    let ftm = parseFloat(req.body.ftm);
    if (!checkNBAStat(res, ftm, "ftm")) return;
    let fta = parseFloat(req.body.fta);
    if (!checkNBAStat(res, fta, "fta")) return;
    let ft_pct = parseFloat(req.body.ft_pct);
    if (!checkNBAStat(res, ft_pct, "ft_pct")) return;

    const player = await NBAStatsModel.create({
      name: name,
      season: season,
      games_played: games_played,
      mpg: mpg,
      ppg: ppg,
      apg: apg,
      trpg: trpg,
      drpg: drpg,
      orpg: orpg,
      bpg: bpg,
      spg: spg,
      tpg: tpg,
      fgm: fgm,
      fga: fga,
      fg_pct: fg_pct,
      '3pm': fg3pm,
      '3pta': fg3pa,
      '3pt_pct': fg3_pct,
      ftm: ftm,
      fta: fta,
      ft_pct: ft_pct
    });

    res.status(201).json(player);
  };

  const func = async () => {
    await connect();
    await postPlayer();
    await disconnect();
  };
  func();
});

router.post('/:player', (req, res) => {
  res.status(405).json({
    error: "POST /nba/:player is forbidden. To post a new player, use POST /nba"
  });
});

router.put('/', (req, res) => {
  const putAllPlayers = async () => {
    let season = parseInt(req.body.season);
    if (!checkNBASeason(res, season)) return;
    let games_played = parseInt(req.body.games_played);
    if (!checkNBAGames(res, games_played)) return;
    let mpg = parseFloat(req.body.mpg);
    if (!checkNBAStat(res, mpg, "mpg")) return;
    let ppg = parseFloat(req.body.ppg);
    if (!checkNBAStat(res, ppg, "ppg")) return;
    let apg = parseFloat(req.body.apg);
    if (!checkNBAStat(res, apg, "apg")) return;
    let trpg = parseFloat(req.body.trpg);
    if (!checkNBAStat(res, trpg, "trpg")) return;
    let drpg = parseFloat(req.body.drpg);
    if (!checkNBAStat(res, drpg, "drpg")) return;
    let orpg = parseFloat(req.body.orpg);
    if (!checkNBAStat(res, orpg, "orpg")) return;
    let bpg = parseFloat(req.body.bpg);
    if (!checkNBAStat(res, bpg, "bpg")) return;
    let spg = parseFloat(req.body.spg);
    if (!checkNBAStat(res, spg, "spg")) return;
    let tpg = parseFloat(req.body.tpg);
    if (!checkNBAStat(res, tpg, "tpg")) return;
    let fgm = parseFloat(req.body.fgm);
    if (!checkNBAStat(res, fgm, "fgm")) return;
    let fga = parseFloat(req.body.fga);
    if (!checkNBAStat(res, fga, "fga")) return;
    let fg_pct = parseFloat(req.body.fg_pct);
    if (!checkNBAStat(res, fg_pct, "fg_pct")) return;
    let fg3pm = parseFloat(req.body.fg3pm);
    if (!checkNBAStat(res, fg3pm, "fg3pm")) return;
    let fg3pa = parseFloat(req.body.fg3pa);
    if (!checkNBAStat(res, fg3pa, "fg3pa")) return;
    let fg3_pct = parseFloat(req.body.fg3_pct);
    if (!checkNBAStat(res, fg3_pct, "fg3_pct")) return;
    let ftm = parseFloat(req.body.ftm);
    if (!checkNBAStat(res, ftm, "ftm")) return;
    let fta = parseFloat(req.body.fta);
    if (!checkNBAStat(res, fta, "fta")) return;
    let ft_pct = parseFloat(req.body.ft_pct);
    if (!checkNBAStat(res, ft_pct, "ft_pct")) return;

    const players = await NBAStatsModel.find({});
    for (let i = 0; i < players.length; i++) {
      await NBAStatsModel.updateOne({ name: players[i].name }, {
        name: players[i].name,
        season: season,
        games_played: games_played,
        mpg: mpg,
        ppg: ppg,
        apg: apg,
        trpg: trpg,
        drpg: drpg,
        orpg: orpg,
        bpg: bpg,
        spg: spg,
        tpg: tpg,
        fgm: fgm,
        fga: fga,
        fg_pct: fg_pct,
        '3pm': fg3pm,
        '3pta': fg3pa,
        '3pt_pct': fg3_pct,
        ftm: ftm,
        fta: fta,
        ft_pct: ft_pct
      });
    }

    res.status(201).send("All players updated successfully");
  };

  const func = async () => {
    await connect();
    await putAllPlayers();
    await disconnect();
  }
  func();
});

router.put('/:player', (req, res) => {
  const putPlayer = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");

    const players = await getNBAPlayers();
    if (!players.includes(name)) {
      res.status(404).json({
        error: "Player not found. Valid players: " + players
      });
      return;
    }

    let season = parseInt(req.body.season);
    if (!checkNBASeason(res, season)) return;
    let games_played = parseInt(req.body.games_played);
    if (!checkNBAGames(res, games_played)) return;
    let mpg = parseFloat(req.body.mpg);
    if (!checkNBAStat(res, mpg, "mpg")) return;
    let ppg = parseFloat(req.body.ppg);
    if (!checkNBAStat(res, ppg, "ppg")) return;
    let apg = parseFloat(req.body.apg);
    if (!checkNBAStat(res, apg, "apg")) return;
    let trpg = parseFloat(req.body.trpg);
    if (!checkNBAStat(res, trpg, "trpg")) return;
    let drpg = parseFloat(req.body.drpg);
    if (!checkNBAStat(res, drpg, "drpg")) return;
    let orpg = parseFloat(req.body.orpg);
    if (!checkNBAStat(res, orpg, "orpg")) return;
    let bpg = parseFloat(req.body.bpg);
    if (!checkNBAStat(res, bpg, "bpg")) return;
    let spg = parseFloat(req.body.spg);
    if (!checkNBAStat(res, spg, "spg")) return;
    let tpg = parseFloat(req.body.tpg);
    if (!checkNBAStat(res, tpg, "tpg")) return;
    let fgm = parseFloat(req.body.fgm);
    if (!checkNBAStat(res, fgm, "fgm")) return;
    let fga = parseFloat(req.body.fga);
    if (!checkNBAStat(res, fga, "fga")) return;
    let fg_pct = parseFloat(req.body.fg_pct);
    if (!checkNBAStat(res, fg_pct, "fg_pct")) return;
    let fg3pm = parseFloat(req.body.fg3pm);
    if (!checkNBAStat(res, fg3pm, "fg3pm")) return;
    let fg3pa = parseFloat(req.body.fg3pa);
    if (!checkNBAStat(res, fg3pa, "fg3pa")) return;
    let fg3_pct = parseFloat(req.body.fg3_pct);
    if (!checkNBAStat(res, fg3_pct, "fg3_pct")) return;
    let ftm = parseFloat(req.body.ftm);
    if (!checkNBAStat(res, ftm, "ftm")) return;
    let fta = parseFloat(req.body.fta);
    if (!checkNBAStat(res, fta, "fta")) return;
    let ft_pct = parseFloat(req.body.ft_pct);
    if (!checkNBAStat(res, ft_pct, "ft_pct")) return;

    await NBAStatsModel.updateOne({name: name}, {
      name: name,
      season: season,
      games_played: games_played,
      mpg: mpg,
      ppg: ppg,
      apg: apg,
      trpg: trpg,
      drpg: drpg,
      orpg: orpg,
      bpg: bpg,
      spg: spg,
      tpg: tpg,
      fgm: fgm,
      fga: fga,
      fg_pct: fg_pct,
      '3pm': fg3pm,
      '3pta': fg3pa,
      '3pt_pct': fg3_pct,
      ftm: ftm,
      fta: fta,
      ft_pct: ft_pct
    });
    
    const updatedPlayer = await NBAStatsModel.findOne({name: name});

    res.status(201).json({
      updatedPlayer: updatedPlayer,
      endpoint: "/nba/" + encodeURIComponent(updatedPlayer.name)
    });
  };

  const func = async () => {
    await connect();
    await putPlayer();
    await disconnect();
  };
  func();
});

router.delete('/', (req, res) => {
  const deleteAllPlayers = async () => {
    const result = await NBAStatsModel.deleteMany({});
    res.status(200).json({
      numAffectedPlayers: result.deletedCount
    });
  };

  const func = async () => {
    await connect();
    await deleteAllPlayers();
    await disconnect();
  };
  func();
});

router.delete('/:player', (req, res) => {
  const deleteDoc = async () => {
    let path = req.path.split("/");
    let name = path[path.length-1].replaceAll("%20", " ");

    const result = await NBAStatsModel.deleteOne({name: name});
    res.status(200).json({
      numAffectedPlayers: result.deletedCount
    });
  };

  const func = async () => {
    await connect();
    await deleteDoc();
    await disconnect();
  };
  func();
});

module.exports = router;