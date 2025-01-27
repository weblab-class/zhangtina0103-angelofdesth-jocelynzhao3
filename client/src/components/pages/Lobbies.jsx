import "../../utilities.css";
import "./Lobbies.css";
import BotLobbyCreation from "../modules/BotLobbyCreation";
import LobbyList from "../modules/LobbyList";
import PVPLobbyCreation from "../modules/PVPLobbyCreation";
import Lobby from "../modules/Lobby";

import { useState, useEffect, useContext } from "react";
import { UserInfoContext } from "../App.jsx";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js";

const Lobbies = (props) => {
  const [displayedLobby, setDisplayedLobby] = useState(null);
  // the possible states for the lobby will be {null, newPVP, newBot, #lobbyid}
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [inLobby, setInLobby] = useState(false);
  // TODO: update inLobby by having a useEffect that checks if a player is in any lobby in active games
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  
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
    // initial pulling of the active lobbies
    get("/api/activeLobbies").then((data) => {
      setActiveLobbies(data.lobbies);
      console.log("initial pull: I have set the lobbies to", data.lobbies);
      
      // Check if user is already in a lobby
      if (userInfo && data.lobbies) {
        const userLobby = data.lobbies.find(
          (lobby) => lobby.p1 === userInfo._id || lobby.p2 === userInfo._id
        );
        if (userLobby) {
          console.log("User found in lobby:", userLobby.lobbyid);
          setDisplayedLobby(userLobby.lobbyid);
          setInLobby(true);
        }
      }
    });
  }, [userInfo]);

  useEffect(() => {
    // this will continuously update all the active lobbies
    const processLobbiesUpdate = (data) => {
      console.log("I received", data);
      setActiveLobbies(data);
      console.log("now we have as active lobbies", activeLobbies);
    };

    socket.on("activeLobbies", processLobbiesUpdate);
    return () => {
      socket.off("activeLobbies", (data) => {
        setActiveLobbies(data);
      });
    };
  }, []);

  const handleNewPVP = () => {
    setDisplayedLobby("newPVP");
    setInLobby(true);
  };

  const handleNewBot = () => {
    setDisplayedLobby("newBot");
    setInLobby(true);
  };

  return (
    <div className="Lobbies-container">
      <p>
        {" "}
        this is the pvp page, where you can join a lobby or start a lobby.
      </p>
      {inLobby ? 
         <p> You are already in a lobby </p> : <div>
         <button onClick={handleNewPVP}>Create New PVP Lobby</button> 
         <button onClick={handleNewBot}>Create New vs Bot Lobby</button>
         </div>
        }
      <div className="u-flex">
        <div>
          <LobbyList lobbies={activeLobbies} 
                      setDisplayedLobby={setDisplayedLobby} 
                      displayedLobby={displayedLobby}
                      setInLobby={setInLobby}
                      formatPlayerDisplay={formatPlayerDisplay}/>
        </div>
        <div>
          {displayedLobby ? (
            <>
              {displayedLobby === "newPVP" ? (
                <PVPLobbyCreation setDisplayedLobby={setDisplayedLobby} />
              ) : (
                <>
                  {displayedLobby === "newBot" ? <BotLobbyCreation /> : 
                  <Lobby lobbyid={displayedLobby} 
                    activeLobbies={activeLobbies}
                    setInLobby={setInLobby} 
                    setDisplayedLobby={setDisplayedLobby}
                    formatPlayerDisplay={formatPlayerDisplay}/>}
                </>
              )}
            </>
          ) : (
            <p> please choose a lobby or create your own! </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobbies;
