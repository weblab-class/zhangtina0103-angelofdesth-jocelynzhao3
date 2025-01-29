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
  const [language, setLanguage] = useState("");
  const [p1ready, setP1Ready] = useState(false);
  const [p2ready, setP2Ready] = useState(false);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState(null);
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
      setLanguage(newlobby.language);
      setP1Ready(newlobby.p1ready);
      setP2Ready(newlobby.p2ready);

      if (newlobby.p1ready && newlobby.p2ready) {
        navigate("/battle/" + newlobby.lobbyid);
      }
    }
  }, [props.activeLobbies, props.lobbyid]);

  useEffect(() => {
    const handleDisconnect = (data) => {
      const currentLobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
      if (currentLobby && (data.userId === currentLobby.p1 || data.userId === currentLobby.p2)) {
        setDisconnectedPlayer(data.userId);
      }
    };

    const handleReconnect = (data) => {
      if (data.userId === disconnectedPlayer) {
        setDisconnectedPlayer(null);
      }
    };

    socket.on("user_disconnected", handleDisconnect);
    socket.on("user_reconnected", handleReconnect);

    return () => {
      socket.off("user_disconnected", handleDisconnect);
      socket.off("user_reconnected", handleReconnect);
    };
  }, [props.lobbyid, props.activeLobbies, disconnectedPlayer]);

  const handleJoinClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) return; // Don't try to join if lobby doesn't exist

    post("/api/joinlobby", { lobbyid: newlobby.lobbyid, player: userInfo._id }).then((result) => {
      // console.log("joined result: ", result);
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
      // console.log("ready result: ", result);
    });
  };

  const handleUnreadyClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    
    if (!newlobby) return; // Don't try to ready up if lobby doesn't exist

    post("/api/updateReadyStatus", {
      lobbyid: newlobby.lobbyid,
      player: userInfo._id,
      isReady: false,
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
      // console.log("leave result: ", result);
      props.setInLobby(false);
      props.setDisplayedLobby("");
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

  // Check if the current user is ready
  const isReady =
    newlobby &&
    ((userInfo._id === newlobby.p1 && newlobby.p1ready) ||
      (userInfo._id === newlobby.p2 && newlobby.p2ready));

  return (
    <>
      <div>
        <div>
          <p className="lobby-player-info">
            Lobby <span>{props.lobbyid}</span> <br/> 
            <strong> {language} </strong> 
          </p>

          <p className="lobby-player-name">
            Player 1: <span>{p1}</span>
          </p>

          <p className="lobby-player-name">
            Player 2: <span>{p2}</span>
          </p>

          {p2 === "Waiting for player..." ? (
            <p className="lobby-waiting-message">Waiting for another player to join...</p>
          ) : (
            <>
              {hasJoined && (
                <>
                { ((p1.slice(-6) === "(You!)" && !p1ready) || (p2.slice(-6) == "(You!)" && !p2ready)) ? (
                  <button
                  className="u-pointer pvp-create-button button-base neon-bg neon-border neon-text" style={{ margin: "6rem auto 0rem auto" }}
                  onClick={handleReadyClick}
                >
                  Ready
                </button>
                ) : (
                  <button
                  className="u-pointer pvp-create-button button-base neon-bg neon-border neon-text" style={{ margin: "6rem auto 0rem auto" }}
                  onClick={handleUnreadyClick}
                >
                  Unready
                </button>
                )
                }
                
                {p1ready && (
                  <p className="lobby-ready-text"> P1 is ready </p> 
                )}
                {p2ready && (
                  <p className="lobby-ready-text"> P2 is ready</p>
                )}
                
                </>
              )}
            </>
          )}

          {props.lobbyid !== "newPVP" && props.lobbyid !== "newBot" && (
            <>
              {disconnectedPlayer && (
                <div className="Lobby-status-message">
                  <span className="player-disconnected">
                    {disconnectedPlayer ===
                    props.activeLobbies.find((l) => l.lobbyid === props.lobbyid)?.p1
                      ? p1
                      : p2}{" "}
                    is disconnected, wait for reconnection or leave the lobby
                  </span>
                </div>
              )}
            </>
          )}

          {!hasJoined && (
            <button
              className="u-pointer pvp-create-button button-base neon-bg neon-border neon-text"
              onClick={handleJoinClick}
              disabled={newlobby && newlobby.p2}
            >
              {newlobby && newlobby.p2 ? "Lobby Full" : "Join"}
            </button>
          )}
        </div>
      </div>
      {props.lobbyid !== "newPVP" && props.lobbyid !== "newBot" && (
        <div className="leave-lobby-container">
          <button
            type="button"
            className="u-pointer pvp-create-button button-base neon-bg neon-border neon-text"
            onClick={handleLeaveClick}
          >
            Leave Lobby
          </button>
        </div>
      )}
    </>
  );
};

export default Lobby;
