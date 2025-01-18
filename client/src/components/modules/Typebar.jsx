import React, { useState } from "react";
import "./Typebar.css";
import { takeCard } from "../../client-socket";

/**
Typebar is where we put in our prompt. 

Proptypes:
  @param {Card} cards are the cards that we are displaying
**/

const TypeBar = (props) => {
  // Example target text
  const prompt = "Word to translate here";
  const targets = props.cards.map((card) => card.target)

  // State for the user's typed input
  const [typedText, setTypedText] = useState("");

  // Function to handle the change in input
  const handleInputChange = (event) => {
    const userInput = event.target.value; 
    setTypedText(userInput);
    if (targets.includes(userInput)){
      console.log("you got the right word");
      const card = props.cards[targets.findIndex((word) => word === userInput)];
      console.log(card);
      takeCard(card);
      setTypedText("");
    };
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
      </div>
    </div>
  );
};

export default TypeBar;
