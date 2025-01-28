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

      if (newlobby.p1ready && newlobby.p2ready) {
        navigate("/battle/" + newlobby.lobbyid);
      }
    }
  }, [props.activeLobbies, props.lobbyid]);

  const handleJoinClick = () => {
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
    if (!newlobby) return; // Don't try to join if lobby doesn't exist

    post("/api/joinlobby", { lobbyid: newlobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("joined result: ", result);
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

  // Get current lobby data
  const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid);
  
  // If lobby doesn't exist and it's not a creation screen, don't render anything
  if (!newlobby && props.lobbyid !== "newPVP" && props.lobbyid !== "newBot") {
    return null;
  }

  // Check if the current user has joined this lobby
  const hasJoined = newlobby && (userInfo._id === newlobby.p1 || userInfo._id === newlobby.p2);
  
  // Check if the current user is ready
  const isReady = newlobby && ((userInfo._id === newlobby.p1 && newlobby.p1ready) || 
                  (userInfo._id === newlobby.p2 && newlobby.p2ready));

  return (
    <div>
      <h3>Lobby {props.lobbyid}</h3>
      <div>
        <p>
          You are {userInfo.name} (Elo: {userInfo.elo})
        </p>
        <p>
          P1: {p1 ? `${p1}${newlobby && newlobby.p1ready ? " (Ready)" : ""}` : "Loading..."}
        </p>
        <p>
          P2: {p2 ? `${p2}${newlobby && newlobby.p2ready ? " (Ready)" : ""}` : "Loading..."}
        </p>

        {!hasJoined ? (
          <button onClick={handleJoinClick}>Join</button>
        ) : (
          <div>
            {isReady ? (
              <p>Waiting for opponent to be ready...</p>
            ) : (
              <>
                {newlobby && newlobby.p2 ? (
                  <button onClick={handleReadyClick}>Ready</button>
                ) : (
                  <p>Waiting for another player to join...</p>
                )}
                <button onClick={handleLeaveClick}>Leave</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
