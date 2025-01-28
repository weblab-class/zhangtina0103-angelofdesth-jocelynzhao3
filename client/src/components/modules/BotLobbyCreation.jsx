import "../../utilities.css";
import "./Lobby.css";
import "./BotLobbyCreation.css";

import { Link, useNavigate } from "react-router-dom";
import {useContext} from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const BotLobbyCreation = (props) => {
    const userContext = useContext(UserContext);
    const { language, setLanguage } = useContext(LanguageContext);
    const { userInfo, setUserInfo } = useContext(UserInfoContext);
    const navigate = useNavigate();

    const handleStartClick = () => {
        // TODO: put player name in here too?
        console.log(userContext);
        // TODO: implement difficulty. Difficulty hardcoded to 1 for now
        post("/api/startBotGame", { p1: userInfo._id, language: language, difficulty: 1}).then(
            navigate("/battle/")
        );
      };

    return (
    <div>
        <h3>New vs Bot Game</h3>
        <div>
        <select
            name="language"
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bot-language-select"
            >
            {/* language value becomes empty string when selected, add more lan */}
            <option value="">Select a language...</option>
            <option value="Spanish">Spanish</option>
            <option value="Chinese">Chinese</option>
            <option value="German">German</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
        </select>

        {language && (
            <button
              onClick={handleStartClick}
              className="bot-create-button button-base neon-bg neon-border neon-text"
            >
              Start A Game
            </button>
          )}
        </div>
    </div>
    )
}

export default BotLobbyCreation;