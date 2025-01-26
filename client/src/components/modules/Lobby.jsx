import "../../utilities.css";
import "./Lobby.css";

import { Link, useNavigate } from "react-router-dom";
import {useContext} from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

/**
 * The screen for creating lobbies
 *
 * Proptypes
 * @param {(string) => ()} displayedLobby - the displayed lobby that we're seeing
 */

const Lobby = (props) => {
    const userContext = useContext(UserContext);
    const { language, setLanguage } = useContext(LanguageContext);
    const { userInfo, setUserInfo } = useContext(UserInfoContext);
    const navigate = useNavigate();

    const handleJoinClick = () => {
        console.log("you are joining the game")
      };

    return (
    <div>
        <h3>Lobby {props.id}</h3>
        <div>
        <p>P1: {userInfo.name} [{userInfo.elo}]</p>

        
        </div>
    </div>
    )
}

export default Lobby;