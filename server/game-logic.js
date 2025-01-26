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
const possibleEffects = ["attack", "attack", "heal", "heal", "lifesteal", "freeze", "3x", "block"];

const basefreezeDuration = 3000;

let activeGames = new Map();

const doEffect = (effectType, game, card, player = "player") => {
  if (effectType === "freeze") return game; // no need to change HP

  const amount = card.effect.amount * game.multiplier;

  if (player === "bot") {
    if (effectType === "attack") {
      game.p1HP = Math.max(0, game.p1HP - amount); // Don't let HP go below 0
      console.log(`Attacked for ${amount} damage. P1 HP now: ${game.p1HP}`);
    } else if (effectType === "heal") {
      game.p2HP = Math.min(100, game.p2HP + amount); // Don't let HP go above 100
      console.log(`Healed for ${amount} HP. P1 HP now: ${game.p2HP}`);
    }
  } else {
    if (effectType === "attack") {
      game.p2HP = Math.max(0, game.p2HP - amount); // Don't let HP go below 0
      console.log(`Attacked for ${amount} damage. P2 HP now: ${game.p2HP}`);
    } else if (effectType === "heal") {
      game.p1HP = Math.min(100, game.p1HP + amount); // Don't let HP go above 100
      console.log(`Healed for ${amount} HP. P1 HP now: ${game.p1HP}`);
    }
  }

  if (effectType === "3x") {
    game.multiplier = game.multiplier * 3; // triples
  } else {
    game.multiplier = 1; // resets multiplier
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
      const type = possibleEffects[getRandomInt(0, possibleEffects.length - 1)];
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
      p1Effects: { freezeUntil: 0, block: false },
      p2Effects: { freezeUntil: 0, block: false },
      multiplier: 1,
    };
    //populate the three starting cards

    let card1 = await newCard(language);
    game.displayCards.push(card1);

    let card2 = await newCard(language);
    game.displayCards.push(card2);

    let card3 = await newCard(language);
    game.displayCards.push(card3);

    activeGames.set(lobby, game);

    console.log("new game started with params", game);
    console.log("current active games are", activeGames);

    // Start bot play when game starts
    if (p2 === "bot") {
      startBotPlay(lobby);
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
      console.log(game.p1);

      const user = await User.findOne({ _id: game.p1 });
      if (user) {
        // Prepending log
        user.log = [p1Log, ...user.log];
        // Updating Elo (ensuring it doesn't drop below 1)
        user.elo = Math.max(1, user.elo + (p1Result === "Win" ? 1 : -1));
        // Save the updated user
        await user.save();
        console.log("User 1 updated successfully:", user);
        // socket this over?
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
        console.log("User 2 updated successfully:", user);
      } else {
        console.error("User 2 not found");
      }
    }
  } catch (error) {
    console.error("Error in handleGameEnd:", error);
  }
};

const playerTakeCard = async (lobby, player, cardIndex, playerType = "player") => {
  let game = activeGames.get(lobby);
  console.log(game);
  const takenCard = game.displayCards[cardIndex];
  console.log("I have received the card", takenCard);

  if (takenCard.effect.type === "attack" || takenCard.effect.type === "heal") {
    game = doEffect(takenCard.effect.type, game, takenCard, playerType);
  } else if (takenCard.effect.type === "lifesteal") {
    // do attack and heal
    game = doEffect("attack", game, takenCard, playerType);
    game = doEffect("heal", game, takenCard, playerType);
  } else if (takenCard.effect.type === "freeze") {
    // Set freeze timestamp in game state
    if (playerType === "bot") {
      game.p1Effects.freezeUntil = Date.now() + basefreezeDuration * game.multiplier; // Freeze for x seconds
    } else {
      game.p2Effects.freezeUntil = Date.now() + basefreezeDuration * game.multiplier;
    }
    console.log("Freeze effect applied!");
  } else if (takenCard.effect.type === "3x") {
    game = doEffect("3x", game, takenCard, playerType);
  }

  // checks if the game is complete with the new updated hps
  await checkWin(game);

  // removes the card and replaces it with a new card
  let replacement = await newCard(game.language);
  game.displayCards[cardIndex] = replacement;
  activeGames.set(game.lobby, { ...game });
  console.log("new cards are now", game.displayCards);
};

// bot takes card
const botTakeCard = (game) => {
  if (!game || game.winner) return; // Don't take cards if game is over

  // Randomly select a card index (0, 1, or 2)
  const randomCardIndex = getRandomInt(0, 3);
  console.log("Bot is taking card at index:", randomCardIndex);
  if (game.p2Effects.freezeUntil <= Date.now()) {
    playerTakeCard(game.lobby, "bot", randomCardIndex, "bot");
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
