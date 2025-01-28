import "../../utilities.css";
import "./Lobbies.css";
import BotLobbyCreation from "../modules/BotLobbyCreation";
import PVPLobbyCreation from "../modules/PVPLobbyCreation";
import Lobby from "../modules/Lobby";

// Import icons
import questionIcon from "../../assets/question.png";
import trophyIcon from "../../assets/trophy.png";
import doorIcon from "../../assets/door.png";

import { useState, useEffect, useContext } from "react";
import { UserInfoContext } from "../App.jsx";
import { UserContext } from "../App";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js";
import { Link, useNavigate } from "react-router-dom";

const Lobbies = (props) => {
  const userContext = useContext(UserContext);
  const [displayedLobby, setDisplayedLobby] = useState(null);
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [showPVPCreation, setShowPVPCreation] = useState(false);
  const [showBotCreation, setShowBotCreation] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [inLobby, setInLobby] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const navigate = useNavigate();

  const formatPlayerDisplay = (playerSetFunc, id) => {
    if (id) {
      get("/api/otheruserinfo", { _id: id }).then((gotInfo) => {
        if (gotInfo) {
          let item = `${gotInfo.name} [${gotInfo.elo}]`;
          if (gotInfo._id === userInfo._id) {
            item = item + " (You!)";
          }
          playerSetFunc(item);
        } else {
          playerSetFunc("Error getting the player from id");
        }
      });
    } else {
      playerSetFunc("Waiting for player...");
    }
  };

  useEffect(() => {
    // initial pulling of the active lobbies
    get("/api/activeLobbies").then(async (data) => {
      // Fetch player names for each lobby
      const lobbiesWithNames = await Promise.all(
        data.lobbies.map(async (lobby) => {
          const hostInfo = await get("/api/otheruserinfo", { _id: lobby.p1 });
          return {
            ...lobby,
            p1name: hostInfo ? hostInfo.name : "Unknown",
            p1elo: hostInfo ? hostInfo.elo : "N/A",
          };
        })
      );
      setActiveLobbies(lobbiesWithNames);
    });
  }, [userInfo]);

  useEffect(() => {
    // this will continuously update all the active lobbies
    const processLobbiesUpdate = async (data) => {
      // Fetch player names for each lobby
      const lobbiesWithNames = await Promise.all(
        data.map(async (lobby) => {
          const hostInfo = await get("/api/otheruserinfo", { _id: lobby.p1 });
          return {
            ...lobby,
            p1name: hostInfo ? hostInfo.name : "Unknown",
            p1elo: hostInfo ? hostInfo.elo : "N/A",
          };
        })
      );
      setActiveLobbies(lobbiesWithNames);
    };

    socket.on("activeLobbies", processLobbiesUpdate);

    // Cleanup: must use the same function reference
    return () => {
      socket.off("activeLobbies", processLobbiesUpdate);
    };
  }, []);

  const handleNewPVP = () => {
    setShowPVPCreation(true);
    setShowBotCreation(false);
    setSelectedLobby(null);
  };

  const handleNewBot = () => {
    setShowBotCreation(true);
    setShowPVPCreation(false);
    setSelectedLobby(null);
  };

  const handleLobbyClick = (lobby) => {
    setSelectedLobby(lobby);
    setShowPVPCreation(false);
    setShowBotCreation(false);
  };

  return (
    <div className="Lobbies-container">
      <div className="Lobbies-top-bar">
        <div className="icon-container">
          <Link to="/instructions" className="instructions-button">
            <img src={questionIcon} alt="instructions" className="question-icon" />
          </Link>
          <Link to="/leaderboard" className="leaderboard-button">
            <img src={trophyIcon} alt="leaderboard" className="trophy-icon" />
          </Link>
          <Link to="/battleProfile" className="profile-button">
            <img
              src={
                userInfo.picture ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              alt="profile"
              className="profile-icon"
            />
          </Link>
          <button
            onClick={() => {
              userContext.handleLogout();
              navigate("/");
            }}
            className="logout-button"
          >
            <img src={doorIcon} alt="sign out" className="door-icon" />
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="action-buttons">
          <button onClick={handleNewBot} className="button-base neon-bg neon-border neon-text">
            Play Against AI
          </button>
          <button onClick={handleNewPVP} className="button-base neon-bg neon-border neon-text">
            Challenge Players
          </button>
        </div>

        <div className="lobby-content">
          <div className="lobbies-table">
            <h2>Active Lobbies</h2>
            <table>
              <thead>
                <tr>
                  <th>Lobby ID</th>
                  <th>Host</th>
                  <th>Type</th>
                  <th>Language</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeLobbies.map((lobby) => (
                  <tr
                    key={lobby.lobbyid}
                    onClick={() => handleLobbyClick(lobby)}
                    className={selectedLobby?.lobbyid === lobby.lobbyid ? "selected" : ""}
                  >
                    <td>{lobby.lobbyid}</td>
                    <td>
                      {lobby.p1name} [{lobby.p1elo}]
                    </td>
                    <td>
                      {lobby.isBot ? "vs AI" : lobby.p2 ? "vs Player" : "Waiting for player..."}
                    </td>
                    <td>{lobby.language}</td>
                    <td>{lobby.gameStarted ? "In Progress" : "Waiting"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(showPVPCreation || showBotCreation || selectedLobby) && (
            <div className="right-panel">
              {showPVPCreation && (
                <div className="creation-box">
                  <h2>Create PVP Game</h2>
                  <PVPLobbyCreation setDisplayedLobby={setDisplayedLobby} />
                </div>
              )}
              {showBotCreation && (
                <div className="creation-box">
                  <h2>Create AI Game</h2>
                  <BotLobbyCreation 
                    setDisplayedLobby={setDisplayedLobby}
                    setSelectedLobby={setSelectedLobby}
                    setShowBotCreation={setShowBotCreation}
                  />
                </div>
              )}
              {selectedLobby && !showPVPCreation && !showBotCreation && (
                <div className="selected-lobby">
                  <h2>Lobby Details</h2>
                  <Lobby
                    lobbyid={selectedLobby.lobbyid}
                    activeLobbies={activeLobbies}
                    setInLobby={setInLobby}
                    setDisplayedLobby={setDisplayedLobby}
                    formatPlayerDisplay={formatPlayerDisplay}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobbies;
