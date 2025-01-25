import "../../utilities.css";
import "./Lobbies.css";
import BotLobbyCreation from "../modules/BotLobbyCreation";
import LobbyList from "../modules/LobbyList";


import { useState } from "react";

const Lobbies = (props) => {
  const [displayedLobby, setDisplayedLobby] = useState(null) 
  // the possible states for the lobby will be {null, newPVP, newBot, #lobbyid}

  const handleNewPVP = () => {
    setDisplayedLobby("newPVP");
  };

  const handleNewBot = () => {
    setDisplayedLobby("newBot");
  };


  return (
    <div>
      <p> this is the pvp page, where you can join a lobby or start a lobby.
      </p>
        <button
          onClick={handleNewPVP}
        >Create New PVP Lobby</button>
        <button
          onClick={handleNewBot}
        >Create New vs Bot Lobby</button>
        <div>
          <LobbyList />
        </div>
        <div> 
          {displayedLobby ? ( 
            <>
            {displayedLobby === "newPVP" ? (
              <p> this is where I would put new pvp </p>
            ) : ( 
              <>
              {displayedLobby === "newBot" ? (
                <BotLobbyCreation/>
              ) : (
                <p> this is where I would show the lobby </p>
              )}
              </> 
            )
          }
          </>
          ) : (
            <p> please choose a lobby or create your own! </p>
          )}
        </div>
    </div>
  );
};

export default Lobbies;
