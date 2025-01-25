import React from "react";
import "./Typebar.css";

/**
 * Typebar is where we put in our prompt.
 * @param {Object} props
 * @param {string} props.typedText - Current text in the input
 * @param {function} props.onType - Callback when text changes
 * @param {boolean} props.isFrozen - Whether typing is currently frozen
 */
const TypeBar = (props) => {
  const handleInputChange = (event) => {
    if (!props.isFrozen) {
      const userInput = event.target.value;
      props.onType(userInput);
    }
  };

  return (
    <div className="type-bar-container">
      <div className="type-bar">
        <input
          type="text"
          value={props.typedText}
          onChange={handleInputChange}
          className={`typed-text ${props.isFrozen ? 'frozen' : ''}`}
          placeholder={props.isFrozen ? "Frozen!" : "Start typing..."}
          disabled={props.isFrozen}
          autoFocus
        />
      </div>
    </div>
  );
};

export default TypeBar;
