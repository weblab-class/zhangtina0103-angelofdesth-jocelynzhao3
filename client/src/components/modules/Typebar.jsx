import React from "react";
import "./Typebar.css";

/**
Typebar is where we put in our prompt.
@param {Object} cards contains words (3 total) to translate and its translation
**/

const TypeBar = (props) => {
  const handleInputChange = (event) => {
    const userInput = event.target.value;
    props.onType(userInput); // Pass the input up to parent
  };

  return (
    <div className="type-bar-container">
      <div className="type-bar">
        {/* User Input Text */}
        <input
          type="text"
          value={props.typedText}
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
