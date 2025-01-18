import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import Spell from "../modules/Spell";
import TypeBar from "../modules/Typebar";

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
  useEffect(() => {
    get("/api/word", { language: "Spanish" }).then((word) => {
      // hard code langauge for now
      setNewWord(word);
    });
  }, []);

  return (
    <div className="Battle-container">
      <p>You have reached the battle page</p>
      <div>
        <TypeBar cards={hardcodedCards} />
      </div>
      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </div>
  );
};

export default Battle;
