import "../../utilities.css";
import "./Start.css";
import "./Instructions.css";

import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";

const Instructions = (props) => {
  // back to start button
  return (
    <div className="Start-container">
      <div className="instructions-page-container">
        <h2 className="instructions-title">How to Play</h2>
        <div className="instructions-container">
          <p className="instructions-text">
            To play this game, <span className="highlight-cyan">translate</span> the displayed words
            into the <span className="highlight-purple">language</span> of your choice. Each word
            corresponds to a <span className="highlight-blue">spell</span>, such as{" "}
            <span className="highlight-red">damaging</span> your opponent or{" "}
            <span className="highlight-green">healing</span> you.{" "}
            <span className="highlight-yellow">Speed</span> and{" "}
            <span className="highlight-orange">accuracy</span> are crucial—your opponent can{" "}
            <span className="highlight-purple">steal</span> the spell by typing the correct answer
            faster than you! Let the battle begin!
          </p>
        </div>

        <h2 className="instructions-title">Spell Types</h2>
        <div className="instructions-container">
          <p className="instructions-text">
            <span className="highlight-red">Attack</span> - Damage specified HP to your opponent
          </p>
          <p className="instructions-text">
            <span className="highlight-green">Heal</span> - Restore specified HP to yourself
          </p>
          <p className="instructions-text">
            <span className="highlight-purple">Lifesteal</span> - Deal damage your opponent and heal
            yourself
          </p>
          <p className="instructions-text">
            <span className="highlight-blue">Freeze</span> - Disable your opponent's keyboard for 3
            seconds
          </p>
          <p className="instructions-text">
            <span className="highlight-brown">Block</span> - Gain 3 seconds of protection of your
            opponent's next attack
          </p>
          <p className="instructions-text">
            <span className="highlight-orange">3x</span> - Triple the effect of the next spell
            (CAUTION: this goes both ways!)
          </p>
        </div>

        <div className="back-to-start-container">
          <Link to="/" className="BattleEnd-button">
            Back to start page!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
