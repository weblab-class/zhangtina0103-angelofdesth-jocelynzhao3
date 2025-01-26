import "../../utilities.css";
import "./Lobbies.css";
import BotLobbyCreation from "../modules/BotLobbyCreation";
import LobbyList from "../modules/LobbyList";
import PVPLobbyCreation from "../modules/PVPLobbyCreation";
import Lobby from "../modules/Lobby";

import { useState, useEffect } from "react";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js";

const Lobbies = (props) => {
  const [displayedLobby, setDisplayedLobby] = useState(null);
  // the possible states for the lobby will be {null, newPVP, newBot, #lobbyid}
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [inLobby, setInLobby] = useState(false);

  useEffect(() => {
    // initial pulling of the active lobbies
    get("/api/activeLobbies").then((data) => {
      setActiveLobbies(data.lobbies);
      console.log("initial pull: I have set the lobbies to", data.lobbies);
    });
  }, []);

  useEffect(() => {
    // this will continuously update all the active lobbies
    const callback = (data) => {
      console.log("I received", data);
      setActiveLobbies(data);
      console.log("now we have as active lobbies", activeLobbies);
    };

    socket.on("activeLobbies", callback);
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
                      setInLobby={setInLobby}/>
        </div>
        <div>
          {displayedLobby ? (
            <>
              {displayedLobby === "newPVP" ? (
                <PVPLobbyCreation setDisplayedLobby={setDisplayedLobby} />
              ) : (
                <>
                  {displayedLobby === "newBot" ? <BotLobbyCreation /> : 
                  <Lobby lobby={displayedLobby}/>}
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
