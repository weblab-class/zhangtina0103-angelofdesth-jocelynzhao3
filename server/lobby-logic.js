const { activeGames } = require("./game-logic");

let activeLobbies = new Map();

// One single instance of an open lobby is as follows
// openLobby = {
//     lobbyid:  - a 4 digit letter code
//     p1: - id of p1
//     p2: - id of p2
//     language: - language of the game
//     p1ready: true/false
//     p2ready: true/false
// }

const IdGenerator = () => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 4) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  if (activeLobbies.has(result)) {
    return IdGenerator();
  } else {
    console.log("new id generated", result);
    return result;
  }
};

const createLobby = (p1, language) => {
  const lobbyid = IdGenerator();
  let lobby = {
    lobbyid: lobbyid,
    p1: p1,
    p2: null,
    language: language,
    p1ready: false,
    p2ready: false,
  };
  activeLobbies.set(lobbyid, lobby);
  console.log(activeLobbies);
  return lobby;
};

const joinLobby = (lobbyid, player) => {
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return false;
  }
  if (!lobby.p1) {
    lobby.p1 = player;
    return true;
  }
  if (!lobby.p2) {
    lobby.p2 = player;
    return true;
  }
  return false;
};

const updateReadyStatus = (lobbyid, player, isReady) => {
  const lobby = activeLobbies.get(lobbyid);
  let response = {success: false, canStart: false, lobby: lobby}
  if (lobby) {
    if (player === lobby.p1) {
      lobby.p1ready = isReady;
      console.log("p1 ready: ", lobby.p1ready);
    } else if (player === lobby.p2) {
      lobby.p2ready = isReady;
      console.log("p2 ready: ", lobby.p2ready);
    }
    if (lobby.p1ready && lobby.p2ready) {
      console.log("LOBBY READY TO START: ", lobbyid);
      response.canStart = true
    }
    response.success = true
  }
  return response;
};

const leaveLobby = (lobbyid, player) => {
  console.log("my input is", lobbyid, player)
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return "error!";
  }
  if (lobby.p1 !== player) {
    if (lobby.p2 !== player) {
      return "error!";
    } else {
      lobby.p2 = "";
    }
  } else {
    lobby.p1 = "";
  }
  console.log("our lobby is now", lobby) 
  // now check if lobby is empty. If lobby is empty, remove it
  if (!lobby.p1 && !lobby.p2) {
    activeLobbies.delete(lobbyid);
  }
  return true
};

const deleteLobby = (lobbyid) => {
  activeGames.delete(lobbyid)
}



module.exports = {
  activeLobbies,
  createLobby,
  joinLobby,
  updateReadyStatus,
  leaveLobby,
  deleteLobby,
};
