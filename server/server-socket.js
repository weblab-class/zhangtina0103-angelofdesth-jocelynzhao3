const gameLogic = require("./game-logic");
const lobbyLogic = require("./lobby-logic");

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
// LOBBY STUFF
const newLobby = (p1, language) => {
  const lobby = lobbyLogic.createLobby(p1, language);
  activeLobbies = Array.from(lobbyLogic.activeLobbies.values());
  console.log("emitting in activeLobbies", activeLobbies);
  io.emit("activeLobbies", activeLobbies);
  return lobby;
};

const leaveLobby = (lobby, player) => {
  const result = lobbyLogic.leaveLobby(lobby, player);
  if (result) {
    activeLobbies = Array.from(lobbyLogic.activeLobbies.values());
    console.log("emitting in activeLobbies", activeLobbies);
    io.emit("activeLobbies", activeLobbies);
  };
  return result
}

const joinLobby = (lobby, player) => {
  const lobbyStatus = lobbyLogic.joinLobby(lobby, player);
  if (lobbyStatus) {
    console.log("got join request, now I am sending back", lobbyStatus);
    io.emit(lobby, lobbyStatus);
    return true;
  }
  return false;
}

const newBotGame = (p1, language, difficulty) => {
  // starts the game with the player's id as the lobby name
  gameLogic.newGame(p1, p1, "bot", language);
};

const newPVPGame = (lobby, p1, p2, language) => {
  gameLogic.newGame(lobby, p1, p2, language);
};

// GAME STUFF
const sendGameState = (game) => {
  io.emit(game.lobby, game);
};

const startRunningGames = (activeGames) => {
  const runGame = async (game) => {
    if (game.winner) {
      try {
        await gameLogic.handleGameEnd(game, game.winner);
        console.log("Game ended");
        io.emit(game.lobby, "over");
      } catch (error) {
        console.error("Error handling game end:", error);
        io.emit(game.lobby, "over");
      }
    } else {
      sendGameState(game);
      console.log("I have sent the game", game);
    }
  };

  const runAllGames = () => {
    if (activeGames) {
      activeGames.forEach((game, lobbyname) => {
        runGame(game);
      });
    }
  };

  setInterval(runAllGames, 1000 / 60); // 60 frames per second
};

startRunningGames(gameLogic.activeGames);

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
        gameLogic.playerTakeCard(card.lobby, card.userId, card.card);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,

  newLobby: newLobby,
  newPVPGame: newPVPGame,
  newBotGame: newBotGame,
  leaveLobby: leaveLobby,
  joinLobby: joinLobby,

  getIo: () => io,
};
