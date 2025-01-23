import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import TypeBar from "../modules/Typebar";
import Player from "../modules/Player";

import { Link, useNavigate } from "react-router-dom";
import { get, post } from "../../utilities";
import { takeCard } from "../../client-socket";
import React, { useState, useEffect, useContext, useRef } from "react";
import { LanguageContext } from "../App";
import { UserInfoContext } from "../App";
import { UserContext } from "../App.jsx";
import { socket } from "../../client-socket.js";

const hardcodedCards = [
  { word: "Salz", english: "salt", effect: "deal 10 damage" },
  { word: "Wasser", english: "water", effect: "deal 10 damage" },
  { word: "Unterwegs", english: "underway", effect: "deal 10 damage" },
];

const Battle = (props) => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const { language } = useContext(LanguageContext);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    lobby: "hardcodedlobbyname",
    language: language,
    p1: "",
    p2: "Enemy",
    p1HP: 100,
    p2HP: 100,
    displayCards: hardcodedCards,
  });
  // gets the Game state on mount
  useEffect(() => {
    socket.on("update", (update) => {
      if (update) {
        if (update !== "over") {
          console.log("I have received the update", update);
          setGameState(update);
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
      console.log("Match found!", matchedWord); // FOR THE SAKE OF DEBUGGING this is here, but we don't actually need to find the card
      setTypedText("");
      takeCard(matchIndex, userContext.userId); // fix later
    }
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
          <div className="Battle-hp-bar">
            <div
              className="Battle-hp-fill player-hp"
              style={{ width: `${(gameState.p1HP / 100) * 100}%` }}
            />
            <div className="Battle-hp-text">{gameState.p1HP} / 100</div>
          </div>
        </div>

        {/* Timer angeline: off for now cuz I don't have that saved in game state yet*/}
        {/* <div className="Battle-timer">
          {Math.floor(gameState.timeLeft / 60)}:
          {(gameState.timeLeft % 60).toString().padStart(2, "0")}
        </div> */}

        {/* Enemy HP (Right) */}
        <div className="Battle-hp-container">
          <div className="Battle-hp-bar">
            <div
              className="Battle-hp-fill enemy-hp"
              style={{ width: `${(gameState.p2HP / 100) * 100}%` }}
            />
            <div className="Battle-hp-text">{gameState.p2HP} / 100</div>
          </div>
        </div>
      </div>

      {/* Main game canvas */}
      <canvas ref={canvasRef} className="Battle-canvas" />

      {/* Avatars below HP bars */}
      <div className="Battle-avatars">
        {/* Player Avatar (Left) */}
        <Player
          player={{
            name: gameState.p1,
            picture: gameState.p1Picture,
            hp: gameState.p1HP,
          }}
        />

        {/* Enemy Avatar (Right) */}
        <Player
          player={{
            name: gameState.p2,
            picture: null,
            hp: gameState.p2HP,
          }}
        />
      </div>

      <div className="Battle-gameplay">
        <p style={{ color: "white" }}>
          {" "}
          The words are:
          {gameState.displayCards[0].word}, {gameState.displayCards[0].english}
          {gameState.displayCards[1].word}, {gameState.displayCards[1].english}
          {gameState.displayCards[2].word}, {gameState.displayCards[2].english}
        </p>
        <TypeBar onType={handleTyping} typedText={typedText} />
        <div className="language-display">
          Debug area: language= <span className="language-text">{language}</span>
        </div>
        <div className="language-display">
          Debug area: typedText= <span className="language-text">{typedText}</span>
        </div>
        {/* <Link to="/end/" className="NavBar-link u-inlineBlock">
          Quit - TODO needs to tell server to end the game
        </Link> */}
      </div>
    </div>
  );
};

export default Battle;
