// Player component with avatar and HP
import React from "react";
import "./Player.css";

/**
 * Player component for battle page
 *
 * Proptypes
 * @param {Object} player - Player object containing:
 *   @param {string} player.name - player's name from UserInfo schema
 *   @param {string} player.picture - player's Google profile picture URL from UserInfo schema
 *   @param {number} player.hp - player's current HP in the game
 *   @param {number} player.elo - player's ELO rating from UserInfo schema (optional)
 */
const Player = ({ player }) => {
  return (
    <div className="Battle-avatar">
      {player.picture ? (
        <img src={player.picture} alt={player.name} className="Battle-avatar-circle" />
      ) : (
        <div className="Battle-avatar-circle">
          {player.name ? player.name.charAt(0).toUpperCase() : "?"}
        </div>
      )}
      <div className="Battle-avatar-name">{player.name || "Loading..."}</div>
    </div>
  );
};

export default Player;
