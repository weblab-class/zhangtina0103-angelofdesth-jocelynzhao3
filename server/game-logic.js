// Taken from catbook w8-complete

/** Utils! */

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

/** Game state 
gameState = {
  p1: string,
  p2: string,
  p1HP: Number,
  p2HP: Number,
  cards: [{}]
};

card = {
  prompt: string, 
  target: string, 
  effect: string
}
**/

/** Game logic */
const playerTakeCard = (player, card) => {
  console.log("The player", player, "has taken the card", card)
};


module.exports = {
  playerTakeCard,
}