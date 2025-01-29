// Player component with avatar and HP
import React from "react";
import "./Player.css";
import shield from "../../assets/shield.png";
import botIcon from "../../assets/bot.png";

/**
 * Player component for battle page
 *
 * Proptypes
 * @param {Object} player - Player object containing:
 *   @param {string} player.name - player's name from UserInfo schema
 *   @param {string} player.picture - player's Google profile picture URL from UserInfo schema
 *   @param {number} player.hp - player's current HP in the game
 *   @param {number} player.blocks - number of active blocks (optional)
 *   @param {number} player.remainingSeconds - remaining seconds for block (optional)
 * @param {boolean} isEnemy - Whether the player is an enemy
 * @param {boolean} isBot - Whether the player is a bot
 */
const Player = ({ player, isEnemy, isBot }) => {
  return (
    <div className={`Battle-avatar ${isEnemy ? 'enemy' : 'player'}`}>
      <div className="Battle-avatar-wrapper">
        <div className="Battle-avatar-circle">
          {isBot ? (
            <img src={botIcon} alt="Bot" className="Battle-avatar-image" />
          ) : player.picture ? (
            <img src={player.picture} alt={player.name} className="Battle-avatar-image" />
          ) : (
            player.name ? player.name.charAt(0).toUpperCase() : "?"
          )}
        </div>
        {player.blocks > 0 && (
          <div className="Battle-avatar-shield">
            <img 
              src={shield} 
              alt="Shield" 
              className="Battle-shield-icon"
              onError={(e) => {
                console.error("Failed to load shield image");
                e.target.style.display = "none";
              }}
            />
            <div className="Battle-shield-count">{player.blocks}</div>
          </div>
        )}
      </div>
      <div className="Battle-avatar-name">{player.name || "Loading..."}</div>
    </div>
  );
};

export default Player;
