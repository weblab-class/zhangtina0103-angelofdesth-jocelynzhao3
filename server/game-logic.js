// Taken from catbook w8-complete

/** Utils! */
const Word = require("./models/word");
const User = require("./user");

/** Helper to generate a random integer */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

// different effects
const possibleEffects = [
  "attack",
  "attack",
  "attack",
  "heal",
  "heal",
  "lifesteal",
  "freeze",
  "3x",
  "block",
];
// const possibleEffects = ["freeze"];

const basefreezeDuration = 3000;

const activeGames = new Map();

const doEffect = (effectType, game, card, playerNumber) => {
  if (effectType === "freeze") return game; // no need to change HP

  const amount = card.effect.amount * game.multiplier;

  if (playerNumber === 2) {
    //p2 attacking
    if (effectType === "lifesteal") {
      // check for block
      const timeNow = Date.now();
      while (game.p1Effects.block.length > 0) {
        const blockTime = game.p1Effects.block[0];
        if (blockTime > timeNow) {
          // Block is still active
          console.log("Lifesteal blocked by P1 and P2 does not heal");
          // Remove just one block
          game.p1Effects.block.shift();
          return game;
        }
        // Remove expired block
        game.p1Effects.block.shift();
      }
      game.p1HP = Math.max(0, game.p1HP - amount); // Don't let HP go below 0
      game.p2HP = Math.min(100, game.p2HP + amount); // Don't let HP go above 100
      return game;
    }

    if (effectType === "attack") {
      // check for block
      const timeNow = Date.now();
      while (game.p1Effects.block.length > 0) {
        const blockTime = game.p1Effects.block[0];
        if (blockTime > timeNow) {
          // Block is still active
          console.log("Attack blocked by P1!");
          // Remove just one block
          game.p1Effects.block.shift();
          return game;
        }
        // Remove expired block
        game.p1Effects.block.shift();
      }

      game.p1HP = Math.max(0, game.p1HP - amount); // Don't let HP go below 0
      console.log(`Attacked for ${amount} damage. P1 HP now: ${game.p1HP}`);
    } else if (effectType === "heal") {
      game.p2HP = Math.min(100, game.p2HP + amount); // Don't let HP go above 100
      console.log(`Healed for ${amount} HP. P2 HP now: ${game.p2HP}`);
      console.log(`Healed for ${amount} HP. P2 HP now: ${game.p2HP}`);
    }
  } else {
    // playerNumber === 1
    if (effectType === "lifesteal") {
      // check for block
      const timeNow = Date.now();
      while (game.p2Effects.block.length > 0) {
        const blockTime = game.p2Effects.block[0];
        if (blockTime > timeNow) {
          // Block is still active
          console.log("Lifesteal blocked by P2 and P1 does not heal");
          // Remove just one block
          game.p2Effects.block.shift();
          return game;
        }
        // Remove expired block
        game.p1Effects.block.shift();
      }
      game.p2HP = Math.max(0, game.p2HP - amount); // Don't let HP go below 0
      game.p1HP = Math.min(100, game.p1HP + amount); // Don't let HP go above 100
      return game;
    }

    //p1 attacking
    if (effectType === "attack") {
      // check for block
      const timeNow = Date.now();
      while (game.p2Effects.block.length > 0) {
        const blockTime = game.p2Effects.block[0];
        if (blockTime > timeNow) {
          // Block is still active
          console.log("Attack blocked by P2!");
          // Remove just one block
          game.p2Effects.block.shift();
          return game;
        }
        // Remove expired block
        game.p2Effects.block.shift();
      }

      game.p2HP = Math.max(0, game.p2HP - amount); // Don't let HP go below 0
      console.log(`Attacked for ${amount} damage. P2 HP now: ${game.p2HP}`);
    } else if (effectType === "heal") {
      game.p1HP = Math.min(100, game.p1HP + amount); // Don't let HP go above 100
      console.log(`Healed for ${amount} HP. P1 HP now: ${game.p1HP}`);
    }
  }

  if (effectType === "3x") {
    game.multiplier = game.multiplier * 3; // multiply by 3 each time
  } else {
    game.multiplier = 1; // resets multiplier for non-3x cards
  }

  // Update the game state in the activeGames map
  activeGames.set(game.lobby, { ...game });
  return game;
};

const getEffectAmount = (type, difficulty) => {
  if (type === "freeze") return "freeze";
  if (type === "3x") return "3x next spell";
  if (type === "block") return "block next attack";
  return Math.floor(10 * difficulty);
};

/** Game logic */
const newCard = async (language) => {
  try {
    // Log the input language
    console.log("Fetching word for language:", language);

    // First check if we have any words for this language
    const count = await Word.countDocuments({ language: language });
    console.log(`Found ${count} words for language ${language}`);

    if (count === 0) {
      console.log("No words found for language:", language);
      // Add some default words if none exist
      const defaultWords = [
        { language: language, word: "hola", english: "hello", difficulty: 1 },
        { language: language, word: "gracias", english: "thank you", difficulty: 1 },
        { language: language, word: "adios", english: "goodbye", difficulty: 1 },
      ];
      await Word.insertMany(defaultWords);
      console.log("Added default words for language:", language);
    }

    // queries the word from the database given the language
    const words = await Word.aggregate([
      { $match: { language: language } },
      { $sample: { size: 1 } }, // Get exactly 1 random word - they'll be unique
    ]);

    console.log("Found word:", words[0]);

    if (!words || words.length === 0) {
      throw new Error("No words returned from database");
    }

    const type = possibleEffects[getRandomInt(0, possibleEffects.length)];
    const card = {
      word: words[0].word,
      english: words[0].english,
      effect: {
        type: type,
        amount: getEffectAmount(type, words[0].difficulty),
      },
      difficulty: words[0].difficulty,
    };

    console.log("Created card:", card);
    return card;
  } catch (err) {
    console.error("Error in newCard:", err);
    // Return a default card instead of null
    return {
      word: "error",
      english: "loading failed",
      effect: {
        type: "attack",
        amount: 10,
      },
      difficulty: 1,
    };
  }
};

const newGame = async (lobby, p1, p2, language) => {
  if (activeGames.get(lobby)) {
    console.log("This game already exists! Nothing added.");
    return;
  }

  // Get initial words from database
  const words = await Word.aggregate([
    { $match: { language: language } },
    { $sample: { size: 3 } }
  ]);

  if (!words || words.length < 3) {
    console.error("Not enough words found for language:", language);
    return;
  }

  // Create initial cards
  const displayCards = words.map(word => ({
    word: word.word,
    english: word.english,
    effect: {
      type: possibleEffects[getRandomInt(0, possibleEffects.length)],
      amount: getEffectAmount(possibleEffects[getRandomInt(0, possibleEffects.length)], word.difficulty),
    },
    difficulty: word.difficulty,
  }));

  const game = {
    lobby: lobby,
    language: language,
    winner: null,
    p1: p1,
    p2: p2,
    p1HP: 100,
    p2HP: 100,
    displayCards: displayCards,
    p1Effects: { freezeUntil: 0, block: [] },
    p2Effects: { freezeUntil: 0, block: [] },
    multiplier: 1,
    lastCardEffect: null,
  };

  activeGames.set(lobby, game);
  console.log("new game started with params", game);

  // Start bot play when game starts
  if (p2 === "bot") {
    startBotPlay(lobby);
  }
};

const checkWin = async (game) => {
  if (game.p1HP <= 0 || game.p2HP <= 0) {
    if (game.p1HP <= 0) {
      game.winner = game.p2;
      console.log("p2 wins");
    } else {
      game.winner = game.p1;
      console.log("p1 wins");
    }
  }
};

const getCurrentTime = () => {
  const date = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const estDate = new Date(date);
  const hours = estDate.getHours();
  const minutes = estDate.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const month = estDate.toLocaleString("default", { month: "short" });
  const day = estDate.getDate();

  return `${formattedHours}:${formattedMinutes} ${ampm} on ${month} ${day}`;
};

const handleGameEnd = async (game, winner) => {
  try {
    activeGames.delete(game.lobby);

    // Only update database if players are not bots
    if (game.p1 !== "bot") {
      const p1Result = winner === game.p1 ? "Win" : "Loss";
      const p1Log = {
        Result: p1Result,
        Opponent: game.p2,
        Language: game.language,
        Date: getCurrentTime(),
      };

      const user = await User.findOne({ _id: game.p1 });
      if (user) {
        // Prepending log
        user.log = [p1Log, ...user.log];
        // Updating Elo (ensuring it doesn't drop below 1)
        user.elo = Math.max(1, user.elo + (p1Result === "Win" ? 1 : -1));
        // Save the updated user
        await user.save();
      } else {
        console.error("User 1 not found");
      }
    }

    if (game.p2 !== "bot") {
      const p2Result = winner === game.p2 ? "Win" : "Loss";
      const p2Log = {
        Result: p2Result,
        Opponent: game.p1,
        Language: game.language,
        Date: getCurrentTime(),
      };

      const user = await User.findOne({ _id: game.p2 });
      if (user) {
        user.log = [p2Log, ...user.log];
        user.elo = Math.max(1, user.elo + (p2Result === "Win" ? 1 : -1));
        await user.save();
      } else {
        console.error("User 2 not found");
      }
    }
  } catch (error) {
    console.error("Error in handleGameEnd:", error);
  }
};

const playerTakeCard = async (lobby, player, cardData, playerType = "player") => {
  let game = activeGames.get(lobby);
  console.log("Current game state:", game);
  const takenCard = cardData;
  console.log("Taking card:", takenCard);

  if (!game) {
    console.error("No game found for lobby:", lobby);
    return;
  }

  const cardIndex = game.displayCards.findIndex((card) => card.word === takenCard.word);
  if (cardIndex === -1) {
    console.error("Card not found in display cards:", takenCard);
    return;
  }

  let playerNumber;
  if (player === game.p1) {
    playerNumber = 1;
  } else if (player === game.p2) {
    playerNumber = 2;
  } else {
    console.error("Invalid player:", player);
    return;
  }

  // Apply effect
  if (takenCard.effect.type === "attack" || takenCard.effect.type === "heal") {
    game = doEffect(takenCard.effect.type, game, takenCard, playerNumber);
  } else if (takenCard.effect.type === "lifesteal") {
    game = doEffect("lifesteal", game, takenCard, playerNumber);
  } else if (takenCard.effect.type === "freeze") {
    const now = Date.now();
    if (playerNumber === 1) {
      game.p2Effects.freezeUntil = now + basefreezeDuration;
    } else {
      game.p1Effects.freezeUntil = now + basefreezeDuration;
    }
  } else if (takenCard.effect.type === "3x") {
    game.multiplier = 3;
    game.lastCardEffect = "3x multiplier active";
  } else if (takenCard.effect.type === "block") {
    const now = Date.now();
    if (playerNumber === 1) {
      game.p1Effects.block.push(now + basefreezeDuration);
    } else {
      game.p2Effects.block.push(now + basefreezeDuration);
    }
  }

  // Get new word from database
  const newWord = await Word.aggregate([
    { $match: { language: game.language } },
    { $sample: { size: 1 } }
  ]);

  if (newWord && newWord[0]) {
    // Replace the used card with a new one
    game.displayCards[cardIndex] = {
      word: newWord[0].word,
      english: newWord[0].english,
      effect: {
        type: possibleEffects[getRandomInt(0, possibleEffects.length)],
        amount: getEffectAmount(type, newWord[0].difficulty),
      },
      difficulty: newWord[0].difficulty,
    };
  }

  // Reset multiplier if it was used (unless we just activated it)
  if (game.multiplier === 3 && takenCard.effect.type !== "3x") {
    game.multiplier = 1;
    game.lastCardEffect = null;
  }

  // Update game state
  activeGames.set(lobby, game);

  // Check for win condition
  await checkWin(game);
  if (game.winner) {
    handleGameEnd(game, game.winner);
    return "over";
  }

  return game;
};

// Helper function to generate a new card
const generateNewCard = async (language) => {
  try {
    return await newCard(language);
  } catch (err) {
    console.error("Error generating new card:", err);
    return {
      word: "error",
      english: "loading failed",
      effect: {
        type: "attack",
        amount: 10,
      },
      difficulty: 1,
    };
  }
};

// bot takes card
const botTakeCard = (game) => {
  if (!game || game.winner) return; // Don't take cards if game is over

  // Randomly select a card index (0, 1, or 2)
  const randomCardIndex = getRandomInt(0, 3);
  console.log("Bot is taking card at index:", randomCardIndex);
  if (game.p2Effects.freezeUntil <= Date.now()) {
    playerTakeCard(game.lobby, "bot", game.displayCards[randomCardIndex], "bot");
  }
};

const startBotPlay = (lobby) => {
  const interval = setInterval(() => {
    const game = activeGames.get(lobby);
    if (!game || game.winner) {
      clearInterval(interval); // Stop bot if game is over
      return;
    }
    botTakeCard(game);
  }, 15000); // 15 seconds

  return interval;
};

module.exports = {
  activeGames,
  newGame,
  playerTakeCard,
  getCurrentTime,
  handleGameEnd,
};
