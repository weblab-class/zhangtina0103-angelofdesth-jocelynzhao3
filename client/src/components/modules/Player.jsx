// Player component with avatar and HP
import React from "react";
import "./Player.css";

const Player = ({ name, avatarUrl, currentHP, maxHP }) => {
  const hpPercentage = (currentHP / maxHP) * 100;
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="Player-container">
      <div className="Player-avatar">
        {avatarUrl ? (
          <img 
            src={avatarUrl}
            alt={`${name}'s avatar`}
            className="Player-avatar-image"
          />
        ) : (
          <div style={{ 
            fontSize: "2rem", 
            fontWeight: "bold",
            color: "#666"
          }}>
            {firstLetter}
          </div>
        )}
      </div>
      <div className="Player-info">
        <div className="Player-name">{name}</div>
        <div className="Player-hp-container">
          <div 
            className="Player-hp-bar" 
            style={{ width: `${hpPercentage}%` }}
          />
          <div className="Player-hp-text">
            {currentHP} / {maxHP} HP
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
