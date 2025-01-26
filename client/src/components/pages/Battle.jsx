import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import TypeBar from "../modules/Typebar";
import Player from "../modules/Player";

import { Link, useNavigate, useParams } from "react-router-dom";
import { get, post } from "../../utilities";
import { takeCard } from "../../client-socket";
import React, { useState, useEffect, useContext, useRef } from "react";
import { LanguageContext } from "../App";
import { UserInfoContext } from "../App";
import { UserContext } from "../App.jsx";
import { socket } from "../../client-socket.js";

const hardcodedCards = [
  { word: "", english: "", effect: { type: "", amount: "" }, difficulty: "" },
  { word: "", english: "", effect: { type: "", amount: "" }, difficulty: "" },
  {
    word: "",
    english: "",
    effect: { type: "", amount: "" },
    difficulty: "",
  },
];

const Battle = (props) => {
  const navigate = useNavigate();
  const { lobby } = useParams(); // Get lobby parameter from URL
  const userContext = useContext(UserContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const { language } = useContext(LanguageContext);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    lobby: lobby || "hardcodedlobbyname", // Use URL lobby parameter or fallback to default
    language: language,
    p1: "",
    p2: "Enemy",
    p1HP: 100,
    p2HP: 100,
    displayCards: hardcodedCards,
    p1Effects: { freezeUntil: 0, block: [] }, // possible effects
    p2Effects: { freezeUntil: 0, block: [] },
    multiplier: 1,
    lastCardEffect: "", // Track the last card effect
  });
  const [animatingCards, setAnimatingCards] = useState(new Set());
  const prevCards = useRef(gameState.displayCards);

  // gets the Game state on mount
  useEffect(() => {
    socket.on("update", (update) => {
      if (update) {
        if (update !== "over") {
          console.log("I have received the update", update);
          // Keep the lastCardEffect from the update if it exists, otherwise keep current value
          setGameState((prevState) => ({
            ...update,
            lastCardEffect: update.lastCardEffect || prevState.lastCardEffect,
          }));
        } else {
          console.log("Game over");
          // Make API call to get updated user info (including new ELO)
          get("/api/userinfo", { _id: userContext.userId })
            .then((userData) => {
              if (userData._id) {
                console.log("Got updated user data");
                setUserInfo(userData); // Update global user info context
                // Only navigate after user info is updated
                navigate("/end/");
              }
            })
            .catch((err) => {
              console.error("Error getting updated user info:", err);
              navigate("/end/"); // Navigate anyway if there's an error
            });
        }
      }
    });
    return () => {
      socket.off("update");
    };
  }, []);

  useEffect(() => {
    // Compare current cards with previous cards
    const newAnimatingCards = new Set();
    gameState.displayCards.forEach((card, index) => {
      if (prevCards.current[index]?.word !== card.word && card.word !== "") {
        newAnimatingCards.add(index);
      }
    });

    if (newAnimatingCards.size > 0) {
      setAnimatingCards(newAnimatingCards);
      // Clear animation flags after animation duration
      setTimeout(() => {
        setAnimatingCards(new Set());
      }, 200); // Match animation duration
    }

    prevCards.current = gameState.displayCards;
  }, [gameState.displayCards]);

  const [typedText, setTypedText] = useState(""); // Track user input

  const handleTyping = (text) => {
    setTypedText(text);

    // Normalize input text: trim spaces and convert to lowercase
    const normalizedInput = text.trim().toLowerCase();

    // Find the index of the matched word, with case-insensitive comparison
    const matchIndex = gameState.displayCards.findIndex(
      (word) => word.english.trim().toLowerCase() === normalizedInput
    );

    if (matchIndex !== -1) {
      const matchedWord = gameState.displayCards[matchIndex];
      console.log("Match found!", matchedWord);
      setTypedText("");
      // Update last card effect before taking the card
      setGameState((prevState) => ({
        ...prevState,
        lastCardEffect: matchedWord.effect.type,
      }));
      takeCard(matchIndex, userContext.userId, gameState.lobby);
    }
  };

  const isKeyboardFrozen = () => {
    const now = Date.now();
    if (userContext.userId === gameState.p1) {
      return now < gameState.p1Effects.freezeUntil;
    } else if (userContext.userId === gameState.p2) {
      return now < gameState.p2Effects.freezeUntil;
    }
    return false;
  };

  const numberBlocks = () => {
    // returns number of blocks and remaining seconds for each player
    const now = Date.now();

    // Clean up and count P1's blocks
    while (gameState.p1Effects.block.length > 0 && gameState.p1Effects.block[0] <= now) {
      gameState.p1Effects.block.shift(); // Remove expired blocks
    }
    const p1Blocks = gameState.p1Effects.block.length;
    const p1RemainingSeconds =
      p1Blocks > 0 ? Math.ceil((gameState.p1Effects.block[0] - now) / 1000) : 0;

    // Clean up and count P2's blocks
    while (gameState.p2Effects.block.length > 0 && gameState.p2Effects.block[0] <= now) {
      gameState.p2Effects.block.shift(); // Remove expired blocks
    }
    const p2Blocks = gameState.p2Effects.block.length;
    const p2RemainingSeconds =
      p2Blocks > 0 ? Math.ceil((gameState.p2Effects.block[0] - now) / 1000) : 0;

    return {
      p1Blocks,
      p2Blocks,
      p1RemainingSeconds,
      p2RemainingSeconds,
    };
  };

  // Add class to App container when component mounts
  useEffect(() => {
    const appContainer = document.querySelector(".App-container");
    if (appContainer) {
      appContainer.classList.add("battle-page");
    }

    // Cleanup when component unmounts
    return () => {
      const appContainer = document.querySelector(".App-container");
      if (appContainer) {
        appContainer.classList.remove("battle-page");
      }
    };
  }, []);

  // Get user's name and picture when component mounts
  // TO DO this should be backend, not front end
  // useEffect(() => {
  //   const getUserData = async () => {
  //     if (userContext && userContext.userId) {
  //       const userData = await get("/api/whoami");
  //       console.log("Battle: Got user data:", userData);
  //       if (userData._id) {
  //         setGameState((prevState) => ({
  //           ...prevState,
  //           p1Picture: userData.picture,
  //         }));
  //       }
  //     }
  //   };
  //   getUserData();
  // }, [userContext, userContext.userId]);

  useEffect(() => {
    console.log("Battle: Current gameState:", gameState);
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prevState) => ({
        ...prevState,
        timeLeft: prevState.timeLeft > 0 ? prevState.timeLeft - 1 : 0,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight - 40;
        drawCanvas(canvasRef.current);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [gameState]);

  return (
    <div className="Battle-container">
      {/* HP Bars and Timer */}
      <div className="Battle-status-bar">
        {/* Player HP (Left) */}
        <div className="Battle-hp-container">
          <div className="Battle-hp-bar" data-hp={gameState.p1HP <= 30 ? "low" : "normal"}>
            <div
              className={`Battle-hp-fill player-hp`}
              style={{ width: `${(gameState.p1HP / 100) * 100}%` }}
            />
            <div className="Battle-hp-text" data-hp={gameState.p1HP <= 30 ? "low" : "normal"}>
              {gameState.p1HP} HP
            </div>
          </div>
        </div>

        {/* Enemy HP (Right) */}
        <div className="Battle-hp-container">
          <div className="Battle-hp-bar" data-hp={gameState.p2HP <= 30 ? "low" : "normal"}>
            <div
              className={`Battle-hp-fill enemy-hp`}
              style={{ width: `${(gameState.p2HP / 100) * 100}%` }}
            />
            <div className="Battle-hp-text" data-hp={gameState.p2HP <= 30 ? "low" : "normal"}>
              {gameState.p2HP} HP
            </div>
          </div>
        </div>
      </div>

      <div className="Battle-game-area">
        {/* Multiplier Display - show when either player or bot uses 3x */}
        {gameState.lastCardEffect === "3x" && gameState.multiplier >= 3 && (
          <div className="Battle-multiplier">
            <div className="Battle-multiplier-text">{gameState.multiplier}x</div>
          </div>
        )}

        {/* HP Bars and Avatars */}
        <div className="Battle-players">
          {/* Player 1 */}
          <div className="Battle-player">
            <Player
              player={{
                name: userInfo?.name || gameState.p1,
                picture: userInfo?.picture,
                hp: gameState.p1HP,
                blocks: numberBlocks().p1Blocks,
                remainingSeconds: numberBlocks().p1RemainingSeconds,
              }}
              isEnemy={false}
            />
            <div className="Battle-hp-bar">
              <div className="Battle-hp-fill" style={{ width: `${gameState.p1HP}%` }}></div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="Battle-player enemy">
            <Player
              player={{
                name: gameState.p2,
                picture: gameState.p2Picture,
                hp: gameState.p2HP,
                blocks: numberBlocks().p2Blocks,
                remainingSeconds: numberBlocks().p2RemainingSeconds,
              }}
              isEnemy={true}
            />
            <div className="Battle-hp-bar">
              <div
                className="Battle-hp-fill enemy-hp"
                style={{ width: `${gameState.p2HP}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main game canvas */}
        <canvas ref={canvasRef} className="Battle-canvas" />

        <div className="Battle-gameplay">
          {/* Word Cards */}
          <div className="Battle-cards-container">
            {gameState.displayCards.map((card, index) => (
              <div
                key={`${card.word}-${index}`}
                className={`Battle-card ${animatingCards.has(index) ? "animate-card" : ""}`}
                data-effect={card.effect.type}
              >
                <div className="Battle-card-content">
                  <div className="Battle-card-effect">{card.effect.type}</div>
                  <div className="Battle-card-divider"></div>
                  <div className="Battle-card-middle">
                    <div
                      className={`Battle-card-word ${
                        card.word.length > 8 ? "Battle-card-word-long" : ""
                      }`}
                    >
                      {card.word}
                    </div>
                    <div className="Battle-card-english">{card.english}</div>
                    <div className="Battle-card-amount">
                      {card.effect.type === "heal" ? (
                        <span>+{card.effect.amount} HP</span>
                      ) : card.effect.type === "attack" ? (
                        <span>-{card.effect.amount} HP</span>
                      ) : card.effect.type === "lifesteal" ? (
                        <span>±{card.effect.amount} HP</span>
                      ) : card.effect.type === "freeze" ? (
                        <span>+3 seconds</span>
                      ) : card.effect.type === "3x" ? (
                        <span>3x</span>
                      ) : card.effect.type === "block" ? (
                        <span>+3 seconds </span>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="Battle-card-effect-description">
                      {card.effect.type === "heal"
                        ? `Heals you for ${card.effect.amount} HP`
                        : card.effect.type === "attack"
                        ? `Deals ${card.effect.amount} damage to your opponent`
                        : card.effect.type === "lifesteal"
                        ? `Deals ${card.effect.amount} damage and heals you for the same amount`
                        : card.effect.type === "freeze"
                        ? "Freezes your opponent for 3 seconds"
                        : card.effect.type === "3x"
                        ? "Triples the effect of your next card"
                        : card.effect.type === "block"
                        ? "3 seconds protection from your opponent's next attack"
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TypeBar onType={handleTyping} typedText={typedText} isFrozen={isKeyboardFrozen()} />

          {/* <div className="language-display">
            Debug area: language= <span className="language-text">{language}</span>
          </div>
          <div className="language-display">
            Debug area: typedText= <span className="language-text">{typedText}</span>
          </div> */}
          {/*
          <div className="language-display">
            Debug area: p1 blocks= <span className="language-text">{numberBlocks().p1Blocks}</span>
          </div>
          <div className="language-display">
            Debug area: p1 remaining seconds= <span className="language-text">{numberBlocks().p1RemainingSeconds}</span>
          </div>
          <div className="language-display">
            Debug area: p2 blocks= <span className="language-text">{numberBlocks().p2Blocks}</span>
          </div>
          <div className="language-display">
            Debug area: p2 remaining seconds= <span className="language-text">{numberBlocks().p2RemainingSeconds}</span>
          </div>
          <div className="language-display">
            Debug area: multiplier= <span className="language-text">{gameState.multiplier}</span>
          </div>
}
          {/* <Link to="/end/" className="NavBar-link u-inlineBlock">
            Quit - TODO needs to tell server to end the game
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Battle;
