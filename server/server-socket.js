const gameLogic = require("./game-logic");
const lobbyLogic = require("./lobby-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const userToTimeout = new Map(); // maps user ID -> timeout object
const gameToTimeout = new Map(); // maps game ID -> timeout object

const LOBBY_TIMEOUT = 30 * 1000; // 1 minute in milliseconds
const GAME_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid);

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
  io.emit("user_reconnected", { userId: user._id }); // Emit reconnect event

  for (const [lobbyId, game] of gameLogic.activeGames) {
    if (game.p1 === user._id || game.p2 === user._id) {
      console.log("reconnecting attempt", lobbyId);
      io.emit(lobbyId, {
        ...game,
      });
    }
  }
  // If there was a pending timeout for this user, clear it
  if (userToTimeout.has(user._id)) {
    clearTimeout(userToTimeout.get(user._id));
    userToTimeout.delete(user._id);
  }

  // Clear any game timeouts for games this user is in
  for (const [gameId, game] of gameLogic.activeGames) {
    if (game.p1 === user._id || game.p2 === user._id) {
      if (gameToTimeout.has(gameId)) {
        clearTimeout(gameToTimeout.get(gameId));
        gameToTimeout.delete(gameId);

        // Notify other players about reconnection
        io.emit(gameId, {
          ...game,
          disconnectedPlayer: null,
          timeoutAt: null,
        });
      }
    }
  }
};

const removeUser = (user, socket) => {
  if (user) {
    delete userToSocketMap[user._id];
    // Emit disconnect event to all clients
    io.emit("user_disconnected", { userId: user._id, timeout: LOBBY_TIMEOUT });
  }
  delete socketToUserMap[socket.id];

  // Set a timeout to remove the user's lobby if they don't reconnect
  if (user) {
    // Clear any existing timeout for this user
    if (userToTimeout.has(user._id)) {
      clearTimeout(userToTimeout.get(user._id));
    }

    // can't be ready if they didn't reconnect
    for (const [lobbyId, lobby] of lobbyLogic.activeLobbies) {
      if (lobby.p1 === user._id) {
        lobbyLogic.updateReadyStatus(lobbyId, lobby.p1, false);
      } else if (lobby.p2 === user._id) {
        lobbyLogic.updateReadyStatus(lobbyId, lobby.p2, false);
      }
    }

    // Set new timeout for lobby cleanup
    const timeout = setTimeout(() => {
      console.log(
        `User ${user._id} did not reconnect within ${
          LOBBY_TIMEOUT / 1000
        } seconds, cleaning up their lobby`
      );
      for (const [lobbyId, lobby] of lobbyLogic.activeLobbies) {
        if (lobby.p1 === user._id || lobby.p2 === user._id) {
          lobbyLogic.leaveLobby(lobbyId, user._id);
        }
      }
      userToTimeout.delete(user._id);
    }, LOBBY_TIMEOUT);

    userToTimeout.set(user._id, timeout);

    // Handle game disconnection
    // for (const [gameId, game] of gameLogic.activeGames) {
    //   if (game.p1 === user._id || game.p2 === user._id) {
    //     // Clear any existing game timeout
    //     if (gameToTimeout.has(gameId)) {
    //       clearTimeout(gameToTimeout.get(gameId));
    //     }

    // // Set new timeout for game cleanup
    // const gameTimeout = setTimeout(() => {
    //   console.log(
    //     `User ${user._id} did not reconnect to game ${gameId} within ${
    //       GAME_TIMEOUT / 1000
    //     } seconds, ending the game`
    //   );

    //   // Determine winner (the player who didn't disconnect)
    //   const winner = game.p1 === user._id ? game.p2 : game.p1;
    //   game.winner = winner;

    //   // Clean up the game
    //   gameLogic.activeGames.delete(gameId);
    //   lobbyLogic.leaveLobby(gameId, game.p1); // kill the lobby after game is over
    //   io.emit(gameId, "over");

    //   gameToTimeout.delete(gameId);
    // }, GAME_TIMEOUT);

    // gameToTimeout.set(gameId, gameTimeout);

    // // Notify other players about disconnection
    // io.emit(gameId, {
    //   ...game,
    //   disconnectedPlayer: user._id,
    //   timeoutAt: Date.now() + GAME_TIMEOUT,
    // });
    //     }
    //   }
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
        io.emit(game.lobby, "over");
        console.log("emitted game over");
        activeGames.delete(game.lobby);
        lobbyLogic.leaveLobby(game.lobby, game.p1); // kill the lobby after game is over
        console.log("Game ended");
      } catch (error) {
        console.error("Error handling game end:", error);
        io.emit(game.lobby, "over");
      }
    } else {
      sendGameState(game);
      // console.log("I have sent the game", game);
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
        console.log("user disconnected");
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
