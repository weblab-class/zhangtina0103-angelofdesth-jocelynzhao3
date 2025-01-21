import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import Spell from "../modules/Spell";
import TypeBar from "../modules/Typebar";
import Player from "../modules/Player";

import { Link } from "react-router-dom";
import { get, post } from "../../utilities";
import { takeCard } from "../../client-socket";
import React, { useState, useEffect, useContext, useRef } from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App.jsx";

const hardcodedCards = [
  { prompt: "Salz", target: "salt", effect: "deal 10 damage" },
  { prompt: "Wasser", target: "water", effect: "deal 10 damage" },
  { prompt: "Unterwegs", target: "underway", effect: "deal 10 damage" },
];

const Battle = (props) => {
  const userContext = useContext(UserContext);
  const { language } = useContext(LanguageContext);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    p1: "",
    p2: "Enemy",
    p1HP: 100,
    p2HP: 100,
    cards: hardcodedCards,
    timeLeft: 300,
    p1Picture: props.picture,
  });

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
  useEffect(() => {
    const getUserData = async () => {
      if (userContext && userContext.userId) {
        const userData = await get("/api/whoami");
        console.log("Battle: Got user data:", userData);
        if (userData._id) {
          setGameState((prevState) => ({
            ...prevState,
            p1: userData.name,
            p1Picture: userData.picture,
          }));
        }
      }
    };
    getUserData();
  }, [userContext, userContext.userId]);

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

        {/* Timer */}
        <div className="Battle-timer">
          {Math.floor(gameState.timeLeft / 60)}:
          {(gameState.timeLeft % 60).toString().padStart(2, "0")}
        </div>

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
        <TypeBar cards={gameState.cards} />
        <Link to="/end/" className="NavBar-link u-inlineBlock">
          Finish battle
        </Link>
      </div>
    </div>
  );
};

export default Battle;
