import React from "react";
import "./Typebar.css";
import snow2 from "../../assets/snow2.png";
import icicle1 from "../../assets/icicle1.png";
import icicle2 from "../../assets/icicle2.png";

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
        {props.isFrozen && (
          <>
            <img src={snow2} alt="Snow" className="snow-right" />
            <img src={icicle1} alt="Icicle 1" className="icicle-1" />
            <img src={icicle2} alt="Icicle 2" className="icicle-2" />
            <img src={icicle1} alt="Icicle 3" className="icicle-3" />
            <img src={icicle2} alt="Icicle 4" className="icicle-4" />
            <img src={icicle1} alt="Icicle 5" className="icicle-5" />
          </>
        )}
        <input
          type="text"
          value={props.typedText}
          onChange={handleInputChange}
          className={`typed-text ${props.isFrozen ? "frozen" : ""}`}
          placeholder={props.isFrozen ? "Frozen!" : "Start typing..."}
          disabled={props.isFrozen}
          autoFocus
        />
      </div>
    </div>
  );
};

export default TypeBar;
