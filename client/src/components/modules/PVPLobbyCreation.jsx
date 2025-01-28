import "../../utilities.css";
import "./Lobby.css";
import "./PVPLobbyCreation.css";

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

  const handleCreateClick = () => {
    post("/api/createLobby", { p1: userInfo._id, language: language }).then((lobby) => {
      if (lobby) {
        console.log("the new lobby id is", lobby.lobby);
        // Update the displayed lobby to show the details of the newly created lobby
        props.setDisplayedLobby(lobby.lobby.lobbyid);
      } else {
        console.log("you are already in a lobby");
      }
    });
  };

  return (
    <div>
      <h3>New PVP Game</h3>
      <div>
        <p>
          P1: {userInfo.name} [{userInfo.elo}]
        </p>
        <select
          name="language"
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="pvp-language-select"
        >
          <option value="spanish">Spanish</option>
          <option value="chinese">Chinese</option>
          <option value="arabic">Arabic</option>
          <option value="french">French</option>
          <option value="german">German</option>
          <option value="korean">Korean</option>
          <option value="hindi">Hindi</option>
          <option value="portuguese">Portuguese</option>
          <option value="afrikaans">Afrikaans</option>
          <option value="vietnamese">Vietnamese</option>
          <option value="japanese">Japanese</option>
          <option value="telugu">Telugu</option>
          <option value="russian">Russian</option>
          <option value="italian">Italian</option>
          <option value="turkish">Turkish</option>
          <option value="zulu">Zulu</option>
        </select>
      </div>
      <button onClick={handleCreateClick} className="pvp-create-button">
        Create Lobby
      </button>
    </div>
  );
};

export default PVPLobbyCreation;
