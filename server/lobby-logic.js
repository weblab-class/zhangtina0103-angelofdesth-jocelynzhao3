let activeLobbies = new Map();
let usersInLobby = new Set();

// One single instance of an open lobby is as follows
// openLobby = {
//     lobbyid:  - a 4 digit letter code
//     p1: - id of p1
//     p2: - id of p2
//     language: - language of the game
//     p1ready: true/false
//     p2ready: true/false
//     active: true
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
  // check if p1 is already in a lobby
  if (usersInLobby.has(p1)) {
    return false;
  }
  usersInLobby.add(p1);
  const lobbyid = IdGenerator();
  let lobby = {
    lobbyid: lobbyid,
    p1: p1,
    p2: null,
    language: language,
    p1ready: false,
    p2ready: false,
    active: true,
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
  // if (!lobby.p1) {       // if there is a lobby there must be a p1
  //   lobby.p1 = player;
  //   return true;
  // }
  if (!lobby.p2) {
    // if there is no p2, we can add the player

    if (usersInLobby.has(player)) {
      // remove them from current lobby
      for (const lobby of activeLobbies.values()) {
        if (lobby.p1 === player || lobby.p2 === player) {
          leaveLobby(lobby.lobbyid, player);
        }
      }
    } else {
      usersInLobby.add(player);
    }
    lobby.p2 = player;
    return true;
  }
  return false;
};

const updateReadyStatus = (lobbyid, player, isReady) => {
  const lobby = activeLobbies.get(lobbyid);
  let response = {
    success: false,
    canStart: false,
    lobbyid: lobby.lobbyid,
    p1: lobby.p1,
    p2: lobby.p2,
    language: lobby.language,
  };
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
      usersInLobby.delete(lobby.p1); // now battling
      usersInLobby.delete(lobby.p2); // now battling
      lobby.active = false;
      response.canStart = true;
    }
    response.success = true;
  }
  return response;
};

const leaveLobby = (lobbyid, player) => {
  console.log("my input is", lobbyid, player);
  const lobby = activeLobbies.get(lobbyid);
  if (!lobby) {
    console.log("Error: lobby not found");
    return false;
  }

  if (player === lobby.p1) {
    // p1 leaving, lobby is deleted
    usersInLobby.delete(lobby.p1);
    usersInLobby.delete(lobby.p2);
    activeLobbies.delete(lobbyid);
    console.log("our lobby is now", lobby);
    return true;
  }

  if (player === lobby.p2) {
    // p2 leaving, lobby can stay
    usersInLobby.delete(lobby.p2);
    lobby.p2 = null;
    lobby.p2ready = false; // just in case
    console.log("our lobby is now", lobby);
    return true;
  }

  // // now check if lobby is empty. If lobby is empty, remove it
  // if (!lobby.p1 && !lobby.p2) {
  //   activeLobbies.delete(lobbyid);
  // }
  return false; //
};

module.exports = {
  activeLobbies,
  createLobby,
  joinLobby,
  updateReadyStatus,
  leaveLobby,
};
