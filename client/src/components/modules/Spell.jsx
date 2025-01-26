// Word to translate and associated action/spell
import { useState, useEffect } from "react";
import "./Spell.css";

/**
 * Spell component displays a card with a word to translate and its associated effect
 * 
 * Proptypes
 * @param {Object} card - The card object containing word, english translation, and effect
 * @param {boolean} isAnimating - Whether the card is currently animating
 */

const Spell = ({ card, isAnimating }) => {
  const [wordChanged, setWordChanged] = useState(false);

  // Detect word changes and trigger animation
  useEffect(() => {
    setWordChanged(true);
    const timer = setTimeout(() => {
      setWordChanged(false);
    }, 300); // Match the animation duration

    return () => clearTimeout(timer);
  }, [card.word]); // Re-run when word changes

  return (
    <div
      className={`Battle-card ${isAnimating ? "animate-card" : ""} ${
        wordChanged ? "word-change-animation" : ""
      }`}
      data-effect={card.effect.type}
    >
      <div className="Battle-card-content">
        <div className="Battle-card-effect">{card.effect.type}</div>
        <div className="Battle-card-divider"></div>
        <div className="Battle-card-middle">
          <div
            className={`Battle-card-word ${
              card.word.length > 8 ? "Battle-card-word-long" : ""
            } ${wordChanged ? "word-pulse" : ""}`}
          >
            {card.word}
          </div>
          <div className="Battle-card-english">{card.english}</div>
          <div className="Battle-card-amount">
            {card.effect.type === "heal" ? (
              <span>+{card.effect.amount} HP</span>
            ) : card.effect.type === "attack" ? (
              <span>-{card.effect.amount} HP</span>
            ) : card.effect.type === "lifesteal" ? (
              <span>±{card.effect.amount} HP</span>
            ) : card.effect.type === "freeze" ? (
              <span>+3 seconds</span>
            ) : card.effect.type === "3x" ? (
              <span>3x</span>
            ) : card.effect.type === "block" ? (
              <span>+3 seconds </span>
            ) : (
              ""
            )}
          </div>
          <div className="Battle-card-effect-description">
            {card.effect.type === "heal"
              ? `Heals you for ${card.effect.amount} HP`
              : card.effect.type === "attack"
              ? `Deals ${card.effect.amount} damage to your opponent`
              : card.effect.type === "lifesteal"
              ? `Deals ${card.effect.amount} damage and heals you for the same amount`
              : card.effect.type === "freeze"
              ? "Freezes your opponent for 3 seconds"
              : card.effect.type === "3x"
              ? "Triples the effect of your next card"
              : card.effect.type === "block"
              ? "3 seconds protection from your opponent's next attack"
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spell;
