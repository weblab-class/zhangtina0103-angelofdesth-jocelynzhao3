import "../../utilities.css";
import "./Lobby.css";

import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

/**
 * The screen for creating lobbies
 *
 * Proptypes
 * @param {string} lobbyid - the displayed lobby that we're seeing
 * @param {Array} activeLobbies - array of all active lobbies
 * @param {function} setInLobby - function to set whether user is in a lobby
 * @param {function} setDisplayedLobby - function to set which lobby is being displayed
 * @param {function} formatPlayerDisplay - function to format player display
 */

const Lobby = (props) => {
  const userContext = useContext(UserContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby && props.lobbyid !== "newPVP" && props.lobbyid !== "newBot") {
      // Lobby no longer exists, clear the display
      props.setDisplayedLobby("");
      props.setInLobby(false);
      return;
    }

    if (newlobby) {
      props.formatPlayerDisplay(setP1, newlobby.p1);
      props.formatPlayerDisplay(setP2, newlobby.p2);

      if (newlobby.p1ready && newlobby.p2ready && !newlobby.isBot) {
        navigate("/battle/" + newlobby.lobbyid);
      }
    }
  }, [props.activeLobbies, props.lobbyid]);

  const handleJoinClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) return; // Don't try to join if lobby doesn't exist

    post("/api/joinlobby", { lobbyid: newlobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("joined result: ", result);
      props.setInLobby(true);
    });
  };

  const handleReadyClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) return; // Don't try to ready up if lobby doesn't exist

    post("/api/updateReadyStatus", {
      lobbyid: newlobby.lobbyid,
      player: userInfo._id,
      isReady: true,
    }).then((result) => {
      console.log("ready result: ", result);
    });
  };

  const handleLeaveClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) {
      // If lobby doesn't exist anymore, just clear the frontend state
      props.setInLobby(false);
      props.setDisplayedLobby("");
      return;
    }

    post("/api/leaveLobby", { lobbyid: newlobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("leave result: ", result);
      props.setInLobby(false);
      props.setDisplayedLobby("");
    });
  };

  const handleStartBotGame = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) return;

    post("/api/startBotGame", { 
      lobbyid: newlobby.lobbyid,
      player: userInfo._id 
    }).then((result) => {
      console.log("start bot game result: ", result);
      // Navigate to battle page after starting bot game
      navigate(`/battle/${newlobby.lobbyid}`);
    });
  };

  // Get current lobby data
  const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
  
  // If lobby doesn't exist and it's not a creation screen, don't render anything
  if (!newlobby && props.lobbyid !== "newPVP" && props.lobbyid !== "newBot") {
    return null;
  }

  // Check if the current user has joined this lobby
  const hasJoined = newlobby && (userInfo._id === newlobby.p1 || userInfo._id === newlobby.p2);
  
  // Check if both players are present
  const hasTwoPlayers = newlobby && newlobby.p1 && newlobby.p2;
  
  // Check if the current user is ready
  const isReady = newlobby && ((userInfo._id === newlobby.p1 && newlobby.p1ready) || 
                  (userInfo._id === newlobby.p2 && newlobby.p2ready));

  return (
    <div className="Lobby-container">
      <h3>Lobby {props.lobbyid}</h3>
      <div className="Lobby-details">
        <p>
          You are {userInfo.name} (Elo: {userInfo.elo})
        </p>
        <p>
          Host: {p1 ? `${p1}` : "Loading..."}
        </p>
        {newlobby && newlobby.isBot ? (
          <p>Opponent: AI Bot</p>
        ) : (
          <p>
            Player 2: {p2 ? `${p2}${newlobby && newlobby.p2ready ? " (Ready)" : ""}` : "Waiting for player..."}
          </p>
        )}
        <p>
          Language: {newlobby ? newlobby.language : "Loading..."}
        </p>

        {!hasJoined ? (
          <div className="Lobby-buttons">
            <button 
              onClick={handleJoinClick} 
              disabled={newlobby && newlobby.p2}
              className="button-base neon-bg neon-border neon-text"
            >
              {newlobby && newlobby.p2 ? "Lobby Full" : "Join"}
            </button>
          </div>
        ) : (
          <div className="Lobby-buttons">
            {newlobby && newlobby.isBot ? (
              <button 
                onClick={handleStartBotGame}
                className="button-base neon-bg neon-border neon-text"
              >
                Start Game
              </button>
            ) : (
              !isReady && hasTwoPlayers && (
                <button 
                  onClick={handleReadyClick}
                  className="button-base neon-bg neon-border neon-text"
                >
                  Ready
                </button>
              )
            )}
            <button 
              onClick={handleLeaveClick}
              className="button-base neon-bg neon-border neon-text"
            >
              Quit
            </button>
          </div>
        )}
        
        {hasJoined && !hasTwoPlayers && !newlobby?.isBot && (
          <p className="Lobby-status">Waiting for another player to join...</p>
        )}
        {hasJoined && hasTwoPlayers && isReady && !newlobby?.isBot && (
          <p className="Lobby-status">Waiting for opponent to be ready...</p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
