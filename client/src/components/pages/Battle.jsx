import "../../utilities.css";
import "./Battle.css";
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
      {newWord && (
        <>
          <Spell language="Spanish" word={newWord.word} />
          <TypeBar english={newWord.english} />
        </>
      )}
      <Link to="/end/" className="NavBar-link">
        Finish battle
      </Link>
    </div>
  );
};

export default Battle;
