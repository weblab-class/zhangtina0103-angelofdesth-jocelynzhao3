/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./user");
const Word = require("./models/word");

// import authentication library
const auth = require("./auth");

// lobby logic for sending
const lobbyLogic = require("./lobby-logic");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

//Lobby APIs
router.get("/activeLobbies", (req, res) => {
  const activeLobbies = Array.from(lobbyLogic.activeLobbies.values());
  console.log("got a request to show all the active lobbies, sending", activeLobbies);
  res.send({ lobbies: activeLobbies });
});

router.post("/createLobby", (req, res) => {
  const lobby = socketManager.newLobby(req.body.p1, req.body.language);
  res.send({ lobby: lobby });
});

router.post("/joinLobby", (req, res) => {
  const result = socketManager.joinLobby(req.body.lobby, req.body.player);
  res.send({ result: result });
});

router.post("/updateReadyStatus", (req, res) => {
  const result = lobbyLogic.updateReadyStatus(req.body.lobby, req.body.player, req.body.isReady);
  res.send({ result: result });
});

router.post("/leaveLobby", (req, res) => {
  const result = socketManager.leaveLobby(req.body.lobby, req.body.player);
  res.send({ result: result });
});

//Game APIs
router.post("/startPVPGame", (req, res) => {
  socketManager.newPVPGame(req.body.lobby, req.body.p1, req.body.p2, req.body.language);
  res.send({});
});

router.post("/startBotGame", (req, res) => {
  socketManager.newBotGame(req.body.p1, req.body.language, req.body.difficulty);
  res.send({});
});

router.get("/userinfo", (req, res) => {
  User.findOne({ _id: req.user._id }).then((userInfo) => {
    res.send(userInfo);
  });
});

router.get("/otheruserinfo", (req, res) => {
  User.findOne({ _id: req.query._id }).then((userInfo) => {
    res.send(userInfo);
  });
});

// gets one word from the database
router.get("/word", (req, res) => {
  Word.aggregate([
    { $match: { language: req.query.language } },
    { $sample: { size: 1 } }, // Get exactly 1 random word - they'll be unique
  ])
    .then((words) => {
      res.send(words); // send word
    })
    .catch((err) => {
      console.log(`Failed to get random words: ${err}`);
      res.status(500).send(err);
    });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
