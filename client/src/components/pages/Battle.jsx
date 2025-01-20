import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import Spell from "../modules/Spell";
import TypeBar from "../modules/Typebar";
import Player from "../modules/Player";

import { Link } from "react-router-dom";
import { get } from "../../utilities";
import React, { useState, useEffect } from "react";

/**
 * Proptypes
 * @param {string} word to translate
 * @param {string} english translation
 */

const hardcodedCards = [
  { prompt: "Salz", target: "salt", effect: "deal 10 damage" },
  { prompt: "Wasser", target: "water", effect: "deal 10 damage" },
  { prompt: "Unterwegs", target: "underway", effect: "deal 10 damage" },
];

const Battle = (props) => {
  const [newWord, setNewWord] = useState(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);

  useEffect(() => {
    get("/api/word", { language: "Spanish" }).then((word) => {
      // hard code langauge for now
      setNewWord(word);
    });
  }, []);

  return (
    <div className="Battle-container">
      <div className="Battle-players">
        <Player
          name="Opponent"
          avatarUrl="/default-avatar.png"
          currentHP={opponentHP}
          maxHP={100}
        />
        <Player
          name={props.userName || "Player"}
          avatarUrl={props.userAvatar || "/default-avatar.png"}
          currentHP={playerHP}
          maxHP={100}
        />
      </div>
      <div className="Battle-gameplay">
        <TypeBar cards={hardcodedCards} />
        <Link to="/end/" className="NavBar-link u-inlineBlock">
          Finish battle
        </Link>
      </div>
    </div>
  );
};

export default Battle;
