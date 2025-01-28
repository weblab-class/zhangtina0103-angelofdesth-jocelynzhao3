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
 * @param {lobbyState} lobbyid - the displayed lobby that we're seeing
 */

const Lobby = (props) => {
  const userContext = useContext(UserContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lobby, setLobby] = useState({  });
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");


  const checkAlreadyInLobby = () => {
    const yourId = userContext.userId
    setHasJoined((yourId === lobby.p1) || (yourId === lobby.p2))
  }

  useEffect(() => {
    console.log(props.activeLobbies)
    console.log("checking against", props.lobbyid);
    const newlobby = props.activeLobbies.find((lobbyc) => lobbyc.lobbyid === props.lobbyid)
    if (newlobby) {
      setLobby(newlobby);
    } else {
      setLobby("");
    }
    
  }, [props.activeLobbies, props.lobbyid]);

  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Lobby state updated:", lobby);
    props.formatPlayerDisplay(setP1, lobby.p1)
    props.formatPlayerDisplay(setP2, lobby.p2)
    checkAlreadyInLobby();

    if (lobby.p1ready && lobby.p2ready) {
      navigate("/battle/" + lobby.lobbyid)
    }
  }, [lobby]);


  const handleJoinClick = () => {
    post("/api/joinlobby", { lobbyid: lobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("joined result: ", result);
      setHasJoined(result);
    });
  };

  const handleReadyClick = () => {
    post("/api/updateReadyStatus", {
      lobbyid: lobby.lobbyid,
      player: userInfo._id,
      isReady: true,
    }).then((result) => {
      console.log("ready result: ", result);
      setIsReady(result);
    });
  };

  const handleLeaveClick = () => {
    post("/api/leaveLobby", { lobbyid: lobby.lobbyid, player: userInfo._id }).then((result) => {
      console.log("leave result: ", result);
      props.setInLobby(false);
      props.setDisplayedLobby("");
    });
  };

  
  

  return (
    <div>
      <h3>Lobby {lobby.lobbyid}</h3>
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
                {(lobby.p1 && lobby.p2) ? (<button className="SingleActiveLobby-readyButton" onClick={handleReadyClick}>
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
