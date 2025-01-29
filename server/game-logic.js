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
const newCard = (language) => {
  // queries the word from the database given the language
  return Word.aggregate([
    { $match: { language: language } },
    { $sample: { size: 1 } }, // Get exactly 1 random word - they'll be unique
  ])
    .then((word) => {
      const type = possibleEffects[getRandomInt(0, possibleEffects.length)];
      const card = {
        word: word[0].word,
        english: word[0].english,
        effect: {
          type: type,
          amount: getEffectAmount(type, word[0].difficulty),
        },
        difficulty: word[0].difficulty,
      };
      return card;
    })
    .catch((err) => {
      console.log(`Failed to get random words: ${err}`);
    });
};

const newGame = async (lobby, p1, p2, language, difficulty = 1) => {
  if (activeGames.get(lobby)) {
    console.log("This game already exists! Nothing added.");
  } else {
    let user1 = null;
    let user2 = null;

    if (p1 !== "bot") {
      user1 = await User.findOne({ _id: p1 });
    }
    if (p2 !== "bot") {
      user2 = await User.findOne({ _id: p2 });
    }
    const game = {
      lobby: lobby,
      language: language,
      winner: null,
      p1: p1,
      p2: p2,
      p1HP: 100,
      p2HP: 100,
      displayCards: [], // this is where we'd populate the initial cards
      p1Effects: { freezeUntil: 0, block: [] }, // block is an increasing array of times when the player is blocked
      p2Effects: { freezeUntil: 0, block: [] },
      multiplier: 1, // Start with 1x multiplier
      lastCardEffect: null, // Initialize lastCardEffect to null, unused
      p1Name: user1 ? user1.name : "bot",
      p2Name: user2 ? user2.name : "bot",
      p1Picture: user1 ? user1.picture : null,
      p2Picture: user2 ? user2.picture : null,
      createdAt: Date.now(), // Add creation timestamp
    };

    //populate the three starting cards efficiently
    const cards = await Promise.all([newCard(language), newCard(language), newCard(language)]);
    game.displayCards.push(...cards);

    activeGames.set(lobby, game);

    console.log("new game started with params", game);
    console.log("current active games are", activeGames);

    // Start bot play when game starts
    if (p2 === "bot") {
      startBotPlay(lobby, difficulty);
    }
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
    updateDB(game, game.winner);
  }
};

// const getCurrentTime = () => {
//   const date = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
//   const estDate = new Date(date);
//   const hours = estDate.getHours();
//   const minutes = estDate.getMinutes();
//   const ampm = hours >= 12 ? "PM" : "AM";
//   const formattedHours = hours % 12 || 12;
//   const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
//   const month = estDate.toLocaleString("default", { month: "short" });
//   const day = estDate.getDate();

//   return `${formattedHours}:${formattedMinutes} ${ampm} on ${month} ${day}`;
// };

const updateDB = async (game, winner) => {
  try {
    // Get user info once at the start
    let user1 = null;
    let user2 = null;

    if (game.p1 !== "bot") {
      user1 = await User.findOne({ _id: game.p1 });
    }
    if (game.p2 !== "bot") {
      user2 = await User.findOne({ _id: game.p2 });
    }

    activeGames.delete(game.lobby);

    const currentDate = new Date();
    const isoString = currentDate.toISOString();
    // Handle p1's game log
    const p1Result = winner === game.p1 ? "Win" : "Loss";
    const p1Log = {
      Opponent: game.p2 === "bot" ? "bot" : user2.name,
      Result: p1Result,
      Language: game.language,
      Date: isoString,
    };

    if (user1) {
      user1.log = [p1Log, ...user1.log];
      user1.elo = Math.max(1, user1.elo + (p1Result === "Win" ? 1 : -1));
      await user1.save();
    } else {
      console.error("User 1 not found");
    }

    // Handle p2's game log
    if (game.p2 !== "bot") {
      const p2Result = winner === game.p2 ? "Win" : "Loss";
      const p2Log = {
        Opponent: user1.name || "bot",
        Result: p2Result,
        Language: game.language,
        Date: isoString,
      };

      if (user2) {
        user2.log = [p2Log, ...user2.log];
        user2.elo = Math.max(1, user2.elo + (p2Result === "Win" ? 1 : -1));
        await user2.save();
      } else {
        console.error("User 2 not found");
      }
    }
  } catch (error) {
    console.error("Error in handleGameEnd:", error);
  }
};

// const handleGameEnd = (game) => {
//   activeGames.delete(game.lobby);
//   // updateDB(game, winner);
// };

const processingCards = new Set();

const playerTakeCard = async (lobby, player, cardData, playerType = "player") => {
  let game = activeGames.get(lobby);
  console.log("Current game state:", game);
  const takenCard = cardData; // Handle both {card: cardObj} and direct cardObj
  console.log("Taking card:", takenCard, "from data", cardData);

  if (!game) {
    console.error("No game found for lobby:", lobby);
    return;
  }

  const cardIndex = game.displayCards.findIndex((card) => card.word === takenCard.word);

  if (cardIndex === -1) {
    console.error("Card not found in display cards:", takenCard);
    return;
  }

  // Check if card is being processed
  const cardKey = `${lobby}-${cardIndex}`;
  if (processingCards.has(cardKey)) {
    console.log("Card is already being processed by another player");
    return;
  }

  // Add card to processing set
  processingCards.add(cardKey);

  try {
    let playerNumber;
    if (player === game.p1) {
      playerNumber = 1;
      console.log("Player 1 taking card");
    } else if (player === game.p2) {
      playerNumber = 2;
      console.log("Player 2 taking card");
    } else {
      console.error("Invalid player:", player);
      return;
    }

    // Double check card is still available
    if (game.displayCards[cardIndex].word !== takenCard.word) {
      console.log("Card has already been taken");
      return;
    }

    if (!takenCard) {
      console.error("No card found", takenCard);
      return;
    }

    if (takenCard.effect.type === "attack" || takenCard.effect.type === "heal") {
      game = doEffect(takenCard.effect.type, game, takenCard, playerNumber);
    } else if (takenCard.effect.type === "lifesteal") {
      // do attack and heal
      game = doEffect("lifesteal", game, takenCard, playerNumber);
    } else if (takenCard.effect.type === "freeze") {
      // Calculate freeze duration before resetting multiplier
      const freezeDuration = basefreezeDuration * game.multiplier;
      console.log(`Applying freeze for ${freezeDuration}ms with multiplier ${game.multiplier}`);

      // Then reset multiplier through doEffect
      game = doEffect("freeze", game, takenCard, playerNumber);

      // Apply freeze effect with saved duration
      if (playerNumber === 2) {
        game.p1Effects.freezeUntil = Date.now() + freezeDuration;
      } else {
        game.p2Effects.freezeUntil = Date.now() + freezeDuration;
      }
    } else if (takenCard.effect.type === "3x") {
      game = doEffect("3x", game, takenCard, playerNumber);
    } else if (takenCard.effect.type === "block") {
      // Save current multiplier
      const currentMultiplier = game.multiplier;

      // Apply block effect with current multiplier
      if (playerNumber === 2) {
        game.p2Effects.block = game.p2Effects.block.concat(
          new Array(currentMultiplier).fill(Date.now() + 3000) // Block for 3 seconds
        );
      } else {
        game.p1Effects.block = game.p1Effects.block.concat(
          new Array(currentMultiplier).fill(Date.now() + 3000)
        );
      }
      console.log(`Block effect applied with multiplier ${currentMultiplier}!`);

      // Reset multiplier
      game = doEffect("block", game, takenCard, playerNumber);
    }

    // Update last card effect for either player or bot
    game.lastCardEffect = takenCard.effect.type;

    // Update the game in activeGames map
    activeGames.set(lobby, game);
    console.log("Updated game state:", game);

    // checks if the game is complete with the new updated hps
    await checkWin(game);

    // removes the card and replaces it with a new card
    let replacement = await newCard(game.language);
    game.displayCards[cardIndex] = replacement;
    activeGames.set(lobby, { ...game });
    console.log("new cards are now", game.displayCards);
  } finally {
    // Always remove from processing set
    processingCards.delete(cardKey);
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

const startBotPlay = (lobby, difficulty) => {
  let waitTime = 15000;
  if (difficulty === 2) {
    waitTime = 9000;
  } else if (difficulty === 3) {
    waitTime = 3000;
  } else {
    waitTime = 15000;
  }

  const interval = setInterval(() => {
    const game = activeGames.get(lobby);
    if (!game || game.winner) {
      clearInterval(interval); // Stop bot if game is over
      return;
    }
    botTakeCard(game);
  }, waitTime); // dependent on difficulty

  return interval;
};

const HOUR_IN_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [lobbyId, game] of activeGames) {
    if (now - game.createdAt >= HOUR_IN_MS) {
      console.log(`Game ${lobbyId} has expired (over 1 hour old)`);
      activeGames.delete(lobbyId);
      const io = require("./server-socket").getIo();
      if (io) {
        io.emit(lobbyId, "over");
      }
    }
  }
}, 60 * 1000); // Check every minute

module.exports = {
  activeGames,
  newGame,
  playerTakeCard,
  // handleGameEnd,
};
