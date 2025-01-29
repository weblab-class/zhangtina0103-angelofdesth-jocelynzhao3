import "../../utilities.css";
import "./SingleActiveLobby.css";
import { useState, useContext, useEffect } from "react";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";
import { socket } from "../../client-socket.js";

const SingleActiveLobby = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [p1, setP1] = useState("Loading...");
  const [p2, setP2] = useState("Loading...");
  const [isUserInLobby, setIsUserInLobby] = useState(false);
  const [disconnectedPlayer, setDisconnectedPlayer] = useState(null);

  useEffect(() => {
    const handleDisconnect = (data) => {
      if (data.userId === props.lobby.p1 || data.userId === props.lobby.p2) {
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
  }, [props.lobby.p1, props.lobby.p2, disconnectedPlayer]);

  useEffect(() => {
    let isMounted = true;

    const updatePlayerDisplay = async (playerSetFunc, id) => {
      if (!id) {
        playerSetFunc("Waiting for player...");
        return;
      }

      try {
        const gotInfo = await get("/api/otheruserinfo", { _id: id });
        if (!isMounted) return;

        if (gotInfo) {
          let item = `${gotInfo.name} [${gotInfo.elo}]`;
          if (userInfo && gotInfo._id === userInfo._id) {
            item = item;
          }
          playerSetFunc(item);
        } else {
          playerSetFunc("Error getting the player");
        }
      } catch (error) {
        if (isMounted) {
          playerSetFunc("Error loading player");
          console.error("Error fetching player info:", error);
        }
      }
    };

    updatePlayerDisplay(setP1, props.lobby.p1);
    updatePlayerDisplay(setP2, props.lobby.p2);

    // Update isUserInLobby state
    if (userInfo) {
      setIsUserInLobby(props.lobby.p1 === userInfo._id || props.lobby.p2 === userInfo._id);
    }

    return () => {
      isMounted = false;
    };
  }, [props.lobby, props.lobby.p1, props.lobby.p2, userInfo]);

  return (
    <div
      className={`lobby-row ${props.active ? "lobby-row-active" : ""} ${
        isUserInLobby ? "current-user" : ""
      }`}
      onClick={() => {
        props.setDisplayedLobby(props.lobby.lobbyid);
        props.setInLobby(true);
      }}
    >
      <div className="lobby-cell">{props.lobby.lobbyid}</div>
      <div className={`lobby-cell ${props.lobby.p1ready ? "player-ready" : ""}`}>
      <span className="lobby-language"> <strong>P1: </strong> {p1} <br/> <strong>P2:</strong> {p2}</span> 
      </div>
      <div className="lobby-cell">
        <span className="lobby-language">{props.lobby.language}</span>
      </div>
    </div>
  );
};

export default SingleActiveLobby;
