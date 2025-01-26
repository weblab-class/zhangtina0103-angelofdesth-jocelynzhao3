import "../../utilities.css";
import "./SingleActiveLobby.css";
import { useState, useContext } from "react";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const SingleActiveLobby = (props) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);

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
    });
  };

  return (
    <div className={`SingleActiveLobby-container`}>
      <p> I am active: {props.active} </p>
      <div className="SingleActiveLobby-info">
        <p>Lobby ID: {props.lobby.lobbyid}</p>
        <p>P1: {props.lobby.p1}</p>
        <p>Language: {props.lobby.language}</p>
      </div>
      {!hasJoined ? (
        <button className="SingleActiveLobby-joinButton" onClick={handleJoinClick}>
          Join Lobby
        </button>
      ) : (
        <div>
          <p>make API call here</p>
          <p>{userInfo.name} has joined the lobby, lobby now full!</p>
          <div className="SingleActiveLobby-buttonContainer">
            {isReady ? (
              <p className="SingleActiveLobby-waitingMessage">
                Waiting for opponent to be ready...
              </p>
            ) : (
              <>
                <button className="SingleActiveLobby-readyButton" onClick={handleReadyClick}>
                  Ready to Battle!
                </button>
                <button className="SingleActiveLobby-leaveButton" onClick={handleLeaveClick}>
                  Leave Lobby
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleActiveLobby;
