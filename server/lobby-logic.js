


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
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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
}

const createLobby = (p1, language) => {
    const lobbyid = IdGenerator()
    let lobby = {
        lobbyid: lobbyid,
        p1: p1, 
        p2: null,
        language: language,
        p1ready: null,
        p2ready: null,
    }
    activeLobbies.set(lobbyid, lobby);
    console.log(activeLobbies);
    return lobbyid
};


module.exports = {
    activeLobbies,
    createLobby,
};