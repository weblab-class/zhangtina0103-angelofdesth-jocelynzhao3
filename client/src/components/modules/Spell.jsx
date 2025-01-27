// Word to translate and associated action/spell
import { useState, useEffect, useRef } from "react";
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
  const [fontSize, setFontSize] = useState(40); // Default font size
  const containerRef = useRef(null);
  const textRef = useRef(null);

  // Calculate font size based on text width measurement
  useEffect(() => {
    // Wait for fonts to load to get accurate measurements
    document.fonts.ready.then(() => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Start with max font size
        let size = 40;
        let fits = false;
        
        // Binary search for optimal font size
        let min = 1;
        let max = 40;
        
        while (min <= max) {
          size = Math.floor((min + max) / 2);
          context.font = `${size}px Orbitron`;
          const metrics = context.measureText(card.word);
          const textWidth = Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
          
          if (textWidth <= containerWidth * 0.95) {
            fits = true;
            min = size + 1;
          } else {
            max = size - 1;
          }
        }
        
        // Use the last fitting size
        setFontSize(fits ? size : Math.max(1, size - 1));
      }
    });
  }, [card.word]);

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
            className={`Battle-card-word ${wordChanged ? "word-pulse" : ""}`}
            ref={containerRef}
            style={{ fontSize: `${fontSize}px` }}
          >
            <span ref={textRef} style={{ display: 'inline-block' }}>
              {card.word}
            </span>
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
