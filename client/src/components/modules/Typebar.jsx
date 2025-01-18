import React, { useState } from "react";
import "./TypeBar.css";

const TypeBar = (props) => {
  // Example target text
  const targetText = "Word to translate here";

  // State for the user's typed input
  const [typedText, setTypedText] = useState("");

  // Function to handle the change in input
  const handleInputChange = (event) => {
    setTypedText(event.target.value);
  };

  return (
    <div className="type-bar-container">
      <div className="type-bar">
        {/* Target Text */}
        <div className="target-text">
          <span>{targetText}</span>
        </div>

        {/* User Input Text */}
        <input
          type="text"
          value={typedText}
          onChange={handleInputChange}
          className="typed-text"
          placeholder="Start typing..."
        />
      </div>
      <div className="type-bar">
        {/* Translated Text */}
        <div className="translated-text">
          <span>Correct translation: {props.english}</span>
        </div>
      </div>
    </div>
  );
};

export default TypeBar;
