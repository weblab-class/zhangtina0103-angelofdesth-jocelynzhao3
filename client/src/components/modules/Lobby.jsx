import "../../utilities.css";
import "./Lobby.css";

import { Link, useNavigate } from "react-router-dom";
import {useContext} from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const Lobby = (props) => {
    const userContext = useContext(UserContext);
    const { language, setLanguage } = useContext(LanguageContext);
    const { userInfo, setUserInfo } = useContext(UserInfoContext);
    const navigate = useNavigate();

    const handleJoinClick = () => {
        // TODO: put player name in here too?
        console.log(userContext);
        // TODO: implement difficulty. Difficulty hardcoded to 1 for now
        post("/api/createLobby", { p1: userContext.userId, language: language, difficulty: 1}).then(
        // things
        );
      };

    return (
    <div>
        <h3>New PVP Game</h3>
        <div>
        <p>P1: {userInfo.name} [{userInfo.elo}]</p>

        {language && (
            <button
              onClick={handleCreateClick}
              className="battle-button button-base neon-bg neon-border neon-text"
            >
              Create a Lobby
            </button>
          )}
        </div>
    </div>
    )
}

export default Lobby;