const gameLogic = require("./game-logic");
const lobbyLogic = require("./lobby-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const userToTimeout = new Map(); // maps user ID -> timeout object

const LOBBY_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

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

  // If there was a pending timeout for this user, clear it
  if (userToTimeout.has(user._id)) {
    clearTimeout(userToTimeout.get(user._id));
    userToTimeout.delete(user._id);
  }
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];

  // Set a timeout to remove the user's lobby if they don't reconnect
  if (user) {
    // Clear any existing timeout for this user
    if (userToTimeout.has(user._id)) {
      clearTimeout(userToTimeout.get(user._id));
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      console.log(
        `User ${user._id} did not reconnect within ${
          LOBBY_TIMEOUT / 1000
        } seconds, cleaning up their lobby`
      );
      for (const [lobbyId, lobby] of lobbyLogic.activeLobbies) {
        if (lobby.p1 === user._id || lobby.p2 === user._id) {
          leaveLobby(lobbyId, user._id);
        }
      }
      userToTimeout.delete(user._id);
    }, LOBBY_TIMEOUT);

    userToTimeout.set(user._id, timeout);
  }
};

// LOBBY STUFF
const updateLobbies = () => {
  activeLobbies = Array.from(lobbyLogic.activeLobbies.values());
  console.log("emitting in activeLobbies", activeLobbies);
  io.emit("activeLobbies", activeLobbies);
};

const newLobby = (p1, language) => {
  const lobby = lobbyLogic.createLobby(p1, language);
  updateLobbies();
  return lobby;
};

const leaveLobby = (lobbyid, player) => {
  const result = lobbyLogic.leaveLobby(lobbyid, player);
  if (result) {
    updateLobbies();
  }
  return result;
};

const joinLobby = (lobbyid, player) => {
  const joined = lobbyLogic.joinLobby(lobbyid, player);
  if (joined) {
    updateLobbies();
  }
  return joined;
};

const updateReadyStatus = (lobbyid, player, newReadyState) => {
  const response = lobbyLogic.updateReadyStatus(lobbyid, player, newReadyState);
  if (response.success) {
    if (response.canStart) {
      gameLogic.newGame(response.lobbyid, response.p1, response.p2, response.language);
    }
    updateLobbies(); // okay, we don't need to tell everyone that this was updated
  }
  // TODO: implement it such that only the affected lobby is updated
  return response;
};

const newBotGame = (p1, language, difficulty) => {
  // starts the game with the player's id as the lobby name
  gameLogic.newGame(p1, p1, "bot", language, difficulty);
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
      // console.log("I have sent the game", game);
    }
  };

  const runAllGames = async () => {
    if (activeGames) {
      const gamePromises = Array.from(activeGames).map(([lobbyname, game]) => runGame(game));
      await Promise.all(gamePromises);
    }
  };

  setInterval(async () => {
    await runAllGames();
  }, 1000 / 30); // 60 frames per second
};

startRunningGames(gameLogic.activeGames);

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        console.log("user disconnet");
        // if (user) {
        // check if player socket disconnects, end their lobby
        // if player disconnects, they can rejoin their game? (how are unfinished games cleaned?)
        // for (const [lobbyId, lobby] of lobbyLogic.activeLobbies) {
        //   if (lobby.p1 === user._id || lobby.p2 === user._id) {
        //     leaveLobby(lobbyId, user._id);
        //   }
        // }
        // }
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
  newBotGame: newBotGame,
  leaveLobby: leaveLobby,
  joinLobby: joinLobby,
  updateReadyStatus: updateReadyStatus,

  getIo: () => io,
};
