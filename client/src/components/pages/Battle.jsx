import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import Spell from "../modules/Spell";
import TypeBar from "../modules/Typebar";

import { Link } from "react-router-dom";
import { get } from "../../utilities";
import React, { useState, useEffect, useContext } from "react";

import { LanguageContext } from "../App";

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
  const { language } = useContext(LanguageContext);

  const [newWord, setNewWord] = useState(null);

  useEffect(() => {
    if (language) {
      // Only fetch word if language is selected
      get("/api/word", { language: language }).then((word) => {
        setNewWord(word);
      });
    }
  }, [language]);

  console.log("newWord ", newWord);

  return (
    <div className="Battle-container">
      <p>You have reached the battle page</p>
      <p>Your info and HP = 100</p>
      <p>Your opponent info and HP = 100</p>
      <div>{newWord ? <TypeBar cards={newWord} /> : <p>Loading word...</p>}</div>
      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </div>
  );
};

export default Battle;
