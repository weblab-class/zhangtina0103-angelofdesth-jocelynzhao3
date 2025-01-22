// Taken from catbook w8-complete

/** Utils! */
const Word = require("./models/word");

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

const activeGames = new Map();

/**

card = {
  word: string, 
  english: string, 
  effect: of the form: 
    {type: "damage" or "heal"
    amount: int}
}
**/

/** Game logic */
const newCard = (language) => {
  // queries the word from the database given the language
  return Word.aggregate([
      { $match: { language: language } },
      { $sample: { size: 1 } }, // Get exactly 1 random word - they'll be unique
    ]).then((word) => {
      const card = {
        word: word[0].word,
        english: word[0].english,
        effect: null,
      };
      return card;
    }).catch((err) => {
      console.log(`Failed to get random words: ${err}`);
    });
};

const newGame = async (lobby, p1, p2, language) => {
  if (activeGames.get(lobby)) {
    console.log("This game already exists! Nothing added.");
  }
  else {
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
  card1.effect = {type: "damage", amount: 10};
  game.displayCards.push(card1);

  let card2 = await newCard(language);
  card2.effect = {type: "damage", amount: 10};
  game.displayCards.push(card2);

  let card3 = await newCard(language);
  card3.effect = {type: "heal", amount: 5};
  game.displayCards.push(card3);

  activeGames.set(lobby, game);

  console.log("new game started with params", game); 
  console.log("current active games are", activeGames);
  }
};

const checkWin = (game) => {
  if (game.p1HP === 0 || game.p2HP === 0) {
    if (game.p1HP === 0) {
      game.winner = game.p2;
      console.log("p2 wins");
    } else {
      game.winner = game.p1;
      console.log("p1 wins");
    }
  }
}

const handleGameEnd = (game) => {
    activeGames.delete(game.lobby);
    // TO DO (jocelyn): here is where we save the game to the database
    // the params passed in is just the game state (of the form above)
    // you can add whatever else type of cleanup you think needs to happen once a game is over
}

const playerTakeCard = async (lobby, player, cardIndex) => {
  const game = activeGames.get(lobby);
  console.log(game);
  const takenCard = game.displayCards[cardIndex];
  console.log("I have received the card", takenCard);
  
  // does the effect of the card: 
  // for now, we have hardcoded the player to be player 1
  if (takenCard.effect.type === "damage") {
    game.p2HP = game.p2HP - takenCard.effect.amount;
  } else if (takenCard.effect.type === "heal") {
    if (game.p1HP < 100 - takenCard.amount) { // does not allow overheal
      game.p1HP = game.p1HP + takenCard.effect.amount;
    } else {
      game.p1HP = 100; 
    };
  } else {
    console.log("There is an issue with the card type! Expected damage/heal but got", takenCard.type);
  };

  // checks if the game is complete with the new updated hps
  checkWin(game);

  // removes the card and replaces it with a new card
  const card = game.displayCards[cardIndex];
  let replacement = await newCard(game.language); 
  replacement.effect = card.effect;
  game.displayCards[cardIndex] = replacement; 
  console.log("new cards are now", game.displayCards);
};



module.exports = {
  activeGames,
  newGame,
  playerTakeCard,
  handleGameEnd,
}