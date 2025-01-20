// Taken from catbook w8-complete

/** Utils! */

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

const activeGames = [];
const getGameFromLobby = new Map();

/**

card = {
  prompt: string, 
  target: string, 
  effects: of the form: 
    {type: "damage" or "heal"
    amount: int}
}
**/

/** Game logic */
const newGame = (lobby, p1, p2, language) => {
  game = {
    lobby: lobby,
    language: language,
    p1: p1,
    p2: p2,
    p1HP: 100,
    p2HP: 100,
    displayCards: [], // this is where we'd populate the initial cards
    cardQueue: [], // this is where'd we'd populate the queued cards
  };

  activeGames.push(game);
  getGameFromLobby.set(game.lobby, game);

  console.log("new game started with params", game); 
}

const playerTakeCard = (lobby, player, card) => {
  const game = getGameFromLobby.get(lobby);
  console.log(game);
  // TO DO: WRITE CODE HERE TO REMOVE THE CARD 

  // does the effect of the card: 
  // to be very honest, i have to check that it works because I'm not sure how references work in javascript
  if (card.type === "damage") {
    game.p2HP = game.p2HP - card.amount;
  } else if (card.type === "heal") {
    if (game.p1HP < 100 - card.amount) { // does not allow overheal
      game.p1HP = game.p1HP + card.amount;
    } else {
      game.p1HP = 100; 
    };
  } else {
    console.log("There is an issue with the card type! Expected damage/heal but got", card.type);
  };
};

const checkWin = () => {

}



module.exports = {
  newGame,
  playerTakeCard,
}