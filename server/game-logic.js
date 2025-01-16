// Taken from catbook w8-complete

/** Utils! */

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

/** Game state */
const gameState = {
  playerID: string,
  oppID: string,
  playerHP: Number,
  oppHP: Number,
};

/** Game logic */
