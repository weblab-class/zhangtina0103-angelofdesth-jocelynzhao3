import "../../utilities.css";
import "./SingleActiveLobby.css";
import { useState, useContext, useEffect } from "react";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const SingleActiveLobby = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [p1, setP1] = useState("Loading...");
  const [p2, setP2] = useState("Loading...");

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
            item = item + " (You!)";
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

    return () => {
      isMounted = false;
    };
  }, [props.lobby, props.lobby.p1, props.lobby.p2, userInfo]);

  return (
    <div className={`SingleActiveLobby-container ${(props.active) ?
      "SingleActiveLobby-container-active" : ""
      }`}
    onClick={() => {
      props.setDisplayedLobby(props.lobby.lobbyid);
      props.setInLobby(true);
    }}>
      <div className="SingleActiveLobby-info">
        <p>Lobby ID: {props.lobby.lobbyid}</p>
        <p>P1: {p1} </p>
        <p>P2: {p2} </p>
        <p>Language: {props.lobby.language}</p>
      </div>
    </div>
  );
};

export default SingleActiveLobby;
