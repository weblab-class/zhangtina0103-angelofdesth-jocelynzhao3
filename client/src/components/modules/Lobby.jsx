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
 * @param {lobbyState} lobby - the displayed lobby that we're seeing
 */

const Lobby = (props) => {
  const userContext = useContext(UserContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const checkAlreadyInLobby = () => {
    const yourId = userContext.userId
    return (yourId === props.lobby.p1) || (yourId === props.lobby.p2)
  }
  const [hasJoined, setHasJoined] = useState(checkAlreadyInLobby());
  const [isReady, setIsReady] = useState(false);
  const [lobbyState, setLobbyState] = useState({});
  const navigate = useNavigate();

  const processUpdate = (update) => {
    if (update) {
      console.log("I have received the update to lobby status", update);
      setLobbyState(update);
    }
  };

  useEffect(() => {
    socket.on(props.lobby.lobbyid, processUpdate) // updates players if people join

    return () => {
      socket.off(props.lobby.lobbyid);
    }
  }, [])

  const handleJoinClick = () => {
    post("/api/joinlobby", { lobby: props.lobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("joined result: ", result);
      setHasJoined(result);
    });
  };

  const handleReadyClick = () => {
    post("/api/updatereadystatus", {
      lobby: props.lobby.lobbyid,
      player: userInfo._id,
      isReady: true,
    }).then((result) => {
      console.log("ready result: ", result);
      setIsReady(result);
    });
  };

  const handleLeaveClick = () => {
    post("/api/leaveLobby", { lobby: props.lobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("leave result: ", result);
      props.setInLobby(false);
      props.setDisplayedLobby("");
    });
  };

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  const formatPlayerDisplay = (playerSetFunc, id) => {
    if (id) {
    get("/api/otheruserinfo", {_id:id}).then((gotInfo) => {
      if (gotInfo) {
        let item =  `${gotInfo.name} [${gotInfo.elo}]`
        if (gotInfo._id === userInfo._id) {
          item = item + " (You!)"
        }
        playerSetFunc(item)
      } else {
        playerSetFunc("Error getting the player from id")
      }
    }) } else {
      playerSetFunc("Waiting for player...")
    }
  }

  useEffect(() => {
    formatPlayerDisplay(setP1, props.lobby.p1)
    formatPlayerDisplay(setP2, props.lobby.p2)
    console.log("the use effect has been triggered by a change in stuff")
  }, [props.lobby.p1, props.lobby.p2]);

  

  return (
    <div>
      <h3>Lobby {props.lobby.lobbyid}</h3>
      <div>
        <p> You are {userInfo.id} with name {userInfo.name} and elo {userInfo.elo} </p>
        <p>
          P1: {p1 ? p1 : "Loading..."}
        </p>
        <p>
          P2: {p2 ? p2: "Loading..."}
        </p>

        {!hasJoined ? (
        <button className="SingleActiveLobby-joinButton" onClick={handleJoinClick}>
          Join Lobby
        </button>
      ) : (
        <div>
          <p>You are in this lobby.</p>
          <div className="SingleActiveLobby-buttonContainer">
            {isReady ? (
              <p className="SingleActiveLobby-waitingMessage">
                Waiting for opponent to be ready...
              </p>
            ) : (
              <>
                {(props.lobby.p1 && props.lobby.p2) ? (<button className="SingleActiveLobby-readyButton" onClick={handleReadyClick}>
                  Ready to Battle!
                </button>) : ( <p> Waiting for more players...</p>)}
                <button className="SingleActiveLobby-leaveButton" onClick={handleLeaveClick}>
                  Leave Lobby
                </button>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Lobby;
