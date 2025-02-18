import "../../utilities.css";
import "./Lobby.css";
import "./PVPLobbyCreation.css";

import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

/**
 * The screen for creating lobbies
 *
 * Proptypes
 * @param {(string) => ()} setDisplayedLobby - changes the current displayed lobby
 */

const PVPLobbyCreation = (props) => {
  const userContext = useContext(UserContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const navigate = useNavigate();

  const handleCreateClick = () => {
    // TODO: put player name in here too?
    // console.log(userContext);
    // TODO: implement difficulty. Difficulty hardcoded to 1 for now
    post("/api/createLobby", { p1: userInfo._id, language: language }).then((lobby) => {
      if (lobby) {
        // console.log("the new lobby id is", lobby.lobby);
        props.setDisplayedLobby(lobby.lobby.lobbyid);
      } else {
        // console.log("you are already in a lobby");
      }
    });
  };

  return (
    <>
      <div className="pvp-header">
        <h3>New Game vs. Player</h3>
      </div>
      <div className="pvp-container">
        <p className="player-info">
          Player 1: <span>{userInfo.name}</span> [<span>{userInfo.elo}</span>]
        </p>
        <select
          name="language"
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="pvp-language-select"
        >
          {/* language value becomes empty string when selected, add more lan */}
          <option value="">Select a language...</option>
          <option value="Spanish">Spanish</option>
          <option value="Chinese">Chinese</option>
          <option value="German">German</option>
          <option value="French">French</option>
          <option value="Arabic">Arabic</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Afrikaans">Afrikaans</option>
          <option value="Hindi">Hindi</option>
          <option value="Korean">Korean</option>
          <option value="Zulu">Zulu</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Japanese">Japanese</option>
          <option value="Telugu">Telugu</option>
          <option value="Russian">Russian</option>
          <option value="Italian">Italian</option>
          <option value="Turkish">Turkish</option>
        </select>

        {language && (
          <button
            onClick={handleCreateClick}
            className="pvp-create-button button-base neon-bg neon-border neon-text"
          >
            Create a Lobby
          </button>
        )}
      </div>
      <div className="leave-lobby-container">
        <button
          className="pvp-create-button button-base neon-bg neon-border neon-text"
          onClick={props.handleLeaveLobby}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default PVPLobbyCreation;
