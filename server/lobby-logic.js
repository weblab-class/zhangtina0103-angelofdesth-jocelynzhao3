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

// angeline this function responds to socket event
const joinLobby = (lobbyid, player) => {
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return false;
  }
  if (lobby.p1 === null) {
    return false;
  }
  if (lobby.p2 === null) {
    lobby.p2 = player;
    console.log("lobby full: ", lobbyid);
  }
  return true;
};

const updateReadyStatus = (lobbyid, player, isReady) => {
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return false;
  }
  if (player === lobby.p1) {
    lobby.p1ready = true;
    console.log("p1 ready: ", lobby.p1ready);
  } else if (player === lobby.p2) {
    lobby.p2ready = true;
    console.log("p2 ready: ", lobby.p2ready);
  }
  if (lobby.p1ready && lobby.p2ready) {
    console.log("LOBBY READY TO START: ", lobbyid);
    // startGame(lobbyid);
    return true;
  }
  return false;
};

// AI generated, I kept them in case they become useful
const leaveLobby = (lobbyid, player) => {
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return false;
  }
  if (lobby[player] === null) {
    return false;
  }
  lobby[player] = null;
  return true;
};

const startGame = (lobbyid) => {
  // add lobby to activeGames, tell clients to start
};

const removeLobby = (lobbyid) => {
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    return false;
  }
  activeLobbies.delete(lobbyid);
  return true;
};

module.exports = {
  activeLobbies,
  createLobby,
  joinLobby,
  updateReadyStatus,
  leaveLobby,
  removeLobby,
  startGame,
};
