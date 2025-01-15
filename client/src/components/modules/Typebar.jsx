import React, { useState } from "react";
import "./TypeBar.css";

const TypeBar = () => {
  // Example target text
  const targetText = "The quick brown fox jumps over the lazy dog.";

  // State for the user's typed input
  const [typedText, setTypedText] = useState("");

  // Function to handle the change in input
  const handleInputChange = (event) => {
    setTypedText(event.target.value);
  };

  // Calculate typing accuracy
  const calculateAccuracy = () => {
    const totalLength = targetText.length;
    const matchedLength = typedText.split("").reduce((acc, char, idx) => {
      return char === targetText[idx] ? acc + 1 : acc;
    }, 0);

    return (matchedLength / totalLength) * 100;
  };

  // Function to render the typing accuracy color
  const getAccuracyColor = () => {
    const accuracy = calculateAccuracy();
    if (accuracy === 100) return "green";
    if (accuracy >= 75) return "yellow";
    return "red";
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
    </div>
  );
};

export default TypeBar;
