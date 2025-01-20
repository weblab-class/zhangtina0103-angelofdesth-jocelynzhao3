import React, { useState, useContext } from "react";
import "./Typebar.css";
import { takeCard } from "../../client-socket";
import { UserContext } from "../App";

/**
Typebar is where we put in our prompt.

Proptypes:
  @param {Card} cards are the cards that we are displaying
**/

const TypeBar = (props) => {
  // Idenify the user
  const userContext = useContext(UserContext);

  // Example target text
  const prompt = "Word to translate: " + props.cards.word;
  const targets = [props.cards.english];

  // State for the user's typed input
  const [typedText, setTypedText] = useState("");

  // Function to handle the change in input
  const handleInputChange = (event) => {
    const userInput = event.target.value;
    setTypedText(userInput);
    if (targets.includes(userInput)) {
      console.log("you got the right word");
      const card = props.cards[targets.findIndex((word) => word === userInput)];
      console.log(card); // TODO: delete later, this provides card answer
      // function to update card stack
      takeCard(card, userContext.userId); // game state updater
      setTypedText("");
    }
  };

  return (
    <div className="type-bar-container">
      <div className="type-bar">
        {/* Target Text */}
        <div className="target-text">
          <span>{prompt}</span>
        </div>

        {/* User Input Text */}
        <input
          type="text"
          value={typedText}
          onChange={handleInputChange}
          className="typed-text"
          placeholder="Start typing..."
          autoFocus
        />
        <div>
          {/* Remove this later */}
          <p>Difficulty: {props.cards.difficulty}</p>
        </div>
      </div>
    </div>
  );
};

export default TypeBar;
