// Taken from catbook w8-complete

/** Utils! */
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const Word = require("./models/word");

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

const activeGames = new Map();
const getGameFromLobby = new Map();
let multiplier = 1;

const doEffect = (effectType, game, card) => {
  const amount = card.effect.amount * multiplier;
  
  if (effectType === "attack") {
    game.p2HP = Math.max(0, game.p2HP - amount); // Don't let HP go below 0
    console.log(`Attacked for ${amount} damage. P2 HP now: ${game.p2HP}`);
  } else if (effectType === "heal") {
    game.p1HP = Math.min(100, game.p1HP + amount); // Don't let HP go above 100
    console.log(`Healed for ${amount} HP. P1 HP now: ${game.p1HP}`);
  }
  
  // Update the game state in the activeGames map
  activeGames.set(game.lobby, game);
};

/** card = {
  word: string,
  english: string,
  effect: of the form:
    {type: "damage" or "heal"
    amount: int}
}
**/

// different effects
const possibleEffects = ["attack", "heal", "lifesteal", "freeze", "2x"];

/** Game logic */
const newCard = (language) => {
  // queries the word from the database given the language
  return Word.aggregate([
    { $match: { language: language } },
    { $sample: { size: 1 } }, // Get exactly 1 random word - they'll be unique
  ])
    .then((word) => {
      const card = {
        word: word[0].word,
        english: word[0].english,
        effect: {
          type: possibleEffects[getRandomInt(0, possibleEffects.length - 1)],
          amount: Math.floor(10 + 1.25 * word[0].difficulty),
        },
        difficulty: word[0].difficulty,
      };
      return card;
    })
    .catch((err) => {
      console.log(`Failed to get random words: ${err}`);
    });
};

const newGame = async (lobby, p1, p2, language) => {
  if (activeGames.get(lobby)) {
    console.log("This game already exists! Nothing added.");
  } else {
    game = {
      lobby: lobby,
      language: language,
      winner: null,
      p1: p1,
      p2: p2,
      p1HP: 100,
      p2HP: 100,
      displayCards: [], // this is where we'd populate the initial cards
    };
    //populate the three starting cards

    let card1 = await newCard(language);
    game.displayCards.push(card1);

    let card2 = await newCard(language);
    game.displayCards.push(card2);

    let card3 = await newCard(language);
    game.displayCards.push(card3);

    activeGames.set(lobby, game);
    getGameFromLobby.set(game.lobby, game);

    console.log("New game started with params", game);
    console.log("The words are:");
    game.displayCards.forEach((card, index) => {
      console.log(`Card ${index + 1}: ${card.word} = ${card.english} (${card.effect.type}, amount: ${card.effect.amount})`);
    });
  }
};

const playerTakeCard = async (lobby, player, cardIndex) => {
  const game = activeGames.get(lobby);
  if (!game) {
    console.error("Game not found for lobby:", lobby);
    return;
  }
  
  console.log("Game state before effect:", game);
  const takenCard = game.displayCards[cardIndex];
  console.log(`Player used card: ${takenCard.word} = ${takenCard.english} (${takenCard.effect.type}, amount: ${takenCard.effect.amount})`);

  // double multiplier
  if (takenCard.effect.type === "2x") {
    multiplier = multiplier * 2;
  } else {
    multiplier = 1;
  }

  if (takenCard.effect.type === "attack" || takenCard.effect.type === "heal") {
    doEffect(takenCard.effect.type, game, takenCard);
  } else if (takenCard.effect.type === "lifesteal") {
    // do attack and heal
    doEffect("attack", game, takenCard);
    doEffect("heal", game, takenCard);
  } else if (takenCard.effect.type === "freeze") {
    // p1 can't type for 5 seconds
    console.log("You can't type right now!");
  }

  console.log("Game state after effect:", game);

  // checks if the game is complete with the new updated hps
  if (game.p1HP <= 0) {
    game.winner = game.p2;
    game.p1HP = 0; // Ensure HP doesn't go below 0
    console.log("p2 wins");
  } else if (game.p2HP <= 0) {
    game.winner = game.p1;
    game.p2HP = 0; // Ensure HP doesn't go below 0
    console.log("p1 wins");
  }

  // removes the card and replaces it with a new card
  let replacement = await newCard(game.language);
  game.displayCards[cardIndex] = replacement;
  console.log(`New card at position ${cardIndex}: ${replacement.word} = ${replacement.english} (${replacement.effect.type}, amount: ${replacement.effect.amount})`);
  
  // Update the game state in the maps
  activeGames.set(lobby, game);
  getGameFromLobby.set(game.lobby, game);
  
  console.log("Updated game state:", game);
  return game;
};

// bot
// const botTakesCard

module.exports = {
  activeGames,
  newGame,
  playerTakeCard,
};
