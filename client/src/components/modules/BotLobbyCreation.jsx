import "../../utilities.css";
import "./Lobby.css";

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

    const handleCreateLobby = () => {
        // Create a bot lobby
        post("/api/createLobby", { 
            p1: userInfo._id, 
            language: language,
            isBot: true // Mark this as a bot lobby
        }).then((res) => {
            if (res.lobby) {
                // Set the displayed lobby and select it
                props.setDisplayedLobby(res.lobby.lobbyid);
                props.setSelectedLobby(res.lobby);
                props.setShowBotCreation(false);
            }
        });
    };

    return (
        <div>
            <h3>New vs Bot Game</h3>
            <div>
                <p>
                    P1: {userInfo.name} [{userInfo.elo}]
                </p>
                <select
                    name="language"
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
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
                        onClick={handleCreateLobby}
                        className="battle-button button-base neon-bg neon-border neon-text"
                    >
                        Create a Lobby
                    </button>
                )}
            </div>
        </div>
    );
};

export default BotLobbyCreation;