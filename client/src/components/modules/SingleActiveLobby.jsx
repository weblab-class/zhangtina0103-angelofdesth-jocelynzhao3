import "../../utilities.css";
import "./SingleActiveLobby.css";
import { useState, useContext, useEffect } from "react";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const SingleActiveLobby = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  useEffect(() => {
    props.formatPlayerDisplay(setP1, props.lobby.p1);
    props.formatPlayerDisplay(setP2, props.lobby.p2);
  }, [props.lobby]);

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
        <p>P1/Host/Creator: {p1} </p>
        <p>P2: {p2} </p>
        <p>Language: {props.lobby.language}</p>
      </div>
    </div>
  );
};

export default SingleActiveLobby;
