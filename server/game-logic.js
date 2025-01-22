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

const activeGames = [];
const getGameFromLobby = new Map();
let multiplier = 1;

/**

card = {
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
          amount: 10 + 1.25 * word[0].difficulty,
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
  if (getGameFromLobby.get(lobby)) {
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

    activeGames.push(game);
    getGameFromLobby.set(game.lobby, game);

    console.log("new game started with params", game);
    console.log("current active games are", activeGames);
  }
};

// function for adding/subtracting hp
const doEffect = (effectName, game, takenCard, multiplier = 1) => {
  if (effectName === "attack") {
    if (game.p2HP > takenCard.effect.amount) {
      game.p2HP = game.p2HP - multiplier * takenCard.effect.amount;
    } else {
      game.p2HP = 0;
    }
  } else if (effectName === "heal") {
    if (game.p1HP < 100 - takenCard.amount) {
      // does not allow overheal
      game.p1HP = game.p1HP + multiplier * takenCard.effect.amount;
    } else {
      game.p1HP = 100;
    }
  }
};

const playerTakeCard = async (lobby, player, cardIndex) => {
  const game = getGameFromLobby.get(lobby);
  console.log(game);
  const takenCard = game.displayCards[cardIndex];
  console.log("I have received the card", takenCard);

  // does the effect of the card:
  // for now, we have hardcoded the player to be player 1

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
  } else {
    console.log(
      "There is an issue with the card type! Expected damage/heal but got",
      takenCard.type
    );
  }

  // checks if the game is complete with the new updated hps
  if (game.p1HP <= 0) {
    game.winner = game.p2;
    console.log("p2 wins");
  } else if (game.p2HP <= 0) {
    game.winner = game.p1;
    console.log("p1 wins");
  }

  // removes the card and replaces it with a new card
  const card = game.displayCards[cardIndex];
  let replacement = await newCard(game.language);
  replacement.effect = card.effect;
  game.displayCards[cardIndex] = replacement;
  console.log("new cards are now", game.displayCards);
};

// bot
// const botTakesCard

module.exports = {
  getGameFromLobby,
  newGame,
  playerTakeCard,
};
