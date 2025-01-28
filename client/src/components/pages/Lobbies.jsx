import "../../utilities.css";
import "./Lobbies.css";
import BotLobbyCreation from "../modules/BotLobbyCreation";
import LobbyList from "../modules/LobbyList";
import PVPLobbyCreation from "../modules/PVPLobbyCreation";
import Lobby from "../modules/Lobby";

// Import icons
import questionIcon from "../../assets/question.png";
import trophyIcon from "../../assets/trophy.png";
import doorIcon from "../../assets/door.png";

// Import SVGs
import zuluSvg from "../../images/zulu.svg";
import spanishSvg from "../../images/spanish.svg";
import chineseSvg from "../../images/chinese.svg";
import arabicSvg from "../../images/arabic.svg";
import frenchSvg from "../../images/french.svg";
import germanSvg from "../../images/german.svg";
import koreanSvg from "../../images/korean.svg";
import hindiSvg from "../../images/hindi.svg";
import portugueseSvg from "../../images/portuguese.svg";
import afrikaansSvg from "../../images/afrikaans.svg";
import vietnameseSvg from "../../images/vietnamese.svg";
import japaneseSvg from "../../images/japanese.svg";
import teluguSvg from "../../images/telugu.svg";
import russianSvg from "../../images/russian.svg";
import italianSvg from "../../images/italian.svg";
import turkishSvg from "../../images/turkish.svg";

import { useState, useEffect, useContext } from "react";
import { UserInfoContext } from "../App.jsx";
import { UserContext } from "../App";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js";
import { Link, useNavigate } from "react-router-dom";

const Lobbies = (props) => {
  const userContext = useContext(UserContext);
  const [displayedLobby, setDisplayedLobby] = useState(null);
  // the possible states for the lobby will be {null, newPVP, newBot, #lobbyid}
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [inLobby, setInLobby] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
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
    const loadLobbies = async () => {
      try {
        // Get user info first if not available
        if (!userInfo) {
          const user = await get("/api/whoami");
          if (user._id) {
            setUserInfo(user);
          }
        }

        // Get active lobbies
        const data = await get("/api/activeLobbies");
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
      } catch (err) {
        console.log("Error loading lobbies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLobbies();
  }, [userInfo, setUserInfo]);

  useEffect(() => {
    // this will continuously update all the active lobbies
    const processLobbiesUpdate = (data) => {
      console.log("I received", data);
      setActiveLobbies(data);
      console.log("now we have as active lobbies", activeLobbies);
    };

    socket.on("activeLobbies", processLobbiesUpdate);

    // Cleanup: must use the same function reference
    return () => {
      socket.off("activeLobbies", processLobbiesUpdate);
    };
  }, []);

  useEffect(() => {
    if (!userInfo && !isLoading) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [userInfo, isLoading, navigate]);

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
      {isLoading ? (
        <div className="loading-message">Loading lobbies...</div>
      ) : !userInfo ? (
        <div className="auth-message">
          <p>Please wait while we authenticate you...</p>
          <p>Redirecting you to homepage in {countdown} seconds</p>
        </div>
      ) : (
        <div>
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

          <div className="lobbies-main-content">
            {!inLobby && (
              <div className="lobby-buttons">
                <button
                  onClick={handleNewPVP}
                  className="button-base neon-bg neon-border neon-text"
                >
                  Challenge a Player
                </button>
                <button
                  onClick={handleNewBot}
                  className="button-base neon-bg neon-border neon-text"
                >
                  Practice with Bot
                </button>
              </div>
            )}

            <div className="lobbies-content">
              <div className="lobbies-list">
                <div className="lobbies-header">
                  <h2>Active Battle Lobbies</h2>
                </div>

                {(() => {
                  const userLobby = activeLobbies.find(
                    (lobby) =>
                      (lobby.p1 === userInfo._id && lobby.p1ready) ||
                      (lobby.p2 === userInfo._id && lobby.p2ready)
                  );

                  if (userLobby) {
                    return <p className="waiting-message">Waiting for opponent to be ready...</p>;
                  }

                  return (
                    <LobbyList
                      lobbies={activeLobbies}
                      setDisplayedLobby={setDisplayedLobby}
                      displayedLobby={displayedLobby}
                      setInLobby={setInLobby}
                      formatPlayerDisplay={formatPlayerDisplay}
                    />
                  );
                })()}
              </div>

              <div className="lobby-details">
                {displayedLobby ? (
                  <>
                    {displayedLobby === "newPVP" ? (
                      <PVPLobbyCreation setDisplayedLobby={setDisplayedLobby} />
                    ) : displayedLobby === "newBot" ? (
                      <BotLobbyCreation />
                    ) : (
                      <Lobby
                        lobbyid={displayedLobby}
                        activeLobbies={activeLobbies}
                        setInLobby={setInLobby}
                        setDisplayedLobby={setDisplayedLobby}
                        formatPlayerDisplay={formatPlayerDisplay}
                      />
                    )}
                  </>
                ) : (
                  <div className="select-lobby-message">
                    <p>Please choose a lobby or create your own!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobbies;
