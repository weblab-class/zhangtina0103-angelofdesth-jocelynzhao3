const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid);

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};

// GAME STUFF
const newGame = (p1, language) => {
  // starts the game with the player and a hardcoded lobby name, which is a bot
  gameLogic.newGame("hardcodedlobbyname", p1, "bot", language);
};

const sendGameState = (game) => {
  io.emit("update", game);
};

const startRunningGame = (lobby) => {
  setInterval(() => {
    const game = gameLogic.activeGames.get(lobby);
    console.log(game);
    if (game) {
      if (game.winner) {
      gameLogic.handleGameEnd(game);
      io.emit("update", "over");
    } else {
        sendGameState(game);
    }
  }
  }, 1000 / 60); // 60 frames per second
};

startRunningGame("hardcodedlobbyname");

// freeze typing box
const freezeTyping = () => {
  if (card.userId !== game.p1) {
    io.emit("freeze", game.p1);
  }
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
      });
      socket.on("cards", (card) => {
        console.log("I have received the card", card);
        gameLogic.playerTakeCard("hardcodedlobbyname", card.userId, card.card);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,

  newGame: newGame,

  getIo: () => io,
};
