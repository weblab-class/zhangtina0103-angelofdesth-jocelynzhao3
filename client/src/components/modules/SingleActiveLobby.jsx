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

  // Check if the current user has joined this lobby
  const hasJoined =
    userInfo && (userInfo._id === props.lobby.p1 || userInfo._id === props.lobby.p2);

  // Check if both players are present
  const hasTwoPlayers = props.lobby.p1 && props.lobby.p2;

  // Check if the current user is ready
  const isReady =
    userInfo &&
    ((userInfo._id === props.lobby.p1 && props.lobby.p1ready) ||
      (userInfo._id === props.lobby.p2 && props.lobby.p2ready));

  const handleQuit = () => {
    post("/api/leaveLobby", { lobbyid: props.lobby.lobbyid, player: userInfo._id }).then((res) => {
      if (res.success) {
        props.setDisplayedLobby("");
        props.setInLobby(false);
        props.setSelectedLobby(null);
      }
    });
  };

  const handleReady = () => {
    post("/api/updateReadyStatus", {
      lobbyid: props.lobby.lobbyid,
      player: userInfo._id,
      isReady: true,
    });
  };

  return (
    <div
      className={`SingleActiveLobby-container ${
        props.active ? "SingleActiveLobby-container-active" : ""
      }`}
      onClick={() => {
        props.setDisplayedLobby(props.lobby.lobbyid);
        props.setInLobby(true);
      }}
    >
      <div className="SingleActiveLobby-info">
        <p>Lobby ID: {props.lobby.lobbyid}</p>
        <p>P1 (Host): {p1} </p>
        <p>P2: {p2} </p>
        <p>Language: {props.lobby.language}</p>

        {hasJoined && (
          <div className="SingleActiveLobby-buttons">
            <button
              className="button-base neon-bg neon-border neon-text"
              onClick={(e) => {
                e.stopPropagation();
                handleQuit();
              }}
            >
              Quit
            </button>

            {hasTwoPlayers && !isReady && (
              <button
                className="button-base neon-bg neon-border neon-text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReady();
                }}
              >
                Ready
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleActiveLobby;
