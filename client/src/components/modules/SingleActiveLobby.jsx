import "../../utilities.css";
import "./SingleActiveLobby.css";
import { useState, useContext } from "react";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const SingleActiveLobby = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);


  return (
    <div className={`SingleActiveLobby-container ${props.active ?
      "SingleActiveLobby-container-active" : ""
      }`}
    onClick={() => {
      props.setDisplayedLobby(props.lobby);
      props.setInLobby(true);
    }}>
      <div className="SingleActiveLobby-info">
        <p>Lobby ID: {props.lobby.lobbyid}</p>
        <p>P1: {props.lobby.p1}</p>
        <p>Language: {props.lobby.language}</p>
      </div>
    </div>
  );
};

export default SingleActiveLobby;
