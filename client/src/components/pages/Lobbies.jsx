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
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js";
import { Link } from "react-router-dom";

const Lobbies = (props) => {
  const [displayedLobby, setDisplayedLobby] = useState(null);
  // the possible states for the lobby will be {null, newPVP, newBot, #lobbyid}
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [inLobby, setInLobby] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [language, setLanguage] = useState("");
  
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
    
    // Cleanup: must use the same function reference
    return () => {
      socket.off("activeLobbies", processLobbiesUpdate);
    };
  }, []);

  const handleNewPVP = () => {
    if (!language) {
      alert("Please select a language first!");
      return;
    }
    setDisplayedLobby("newPVP");
    setInLobby(true);
  };

  const handleNewBot = () => {
    if (!language) {
      alert("Please select a language first!");
      return;
    }
    setDisplayedLobby("newBot");
    setInLobby(true);
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
              src={userInfo.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt="profile" 
              className="profile-icon" 
            />
          </Link>
          <button onClick={() => setUserInfo(null)} className="logout-button">
            <img src={doorIcon} alt="sign out" className="door-icon" />
          </button>
        </div>
      </div>

      <div className="svg-wrapper">
        {language === "Zulu" && <img src={zuluSvg} className="skyline-svg" alt="zulu design" />}
        {language === "Spanish" && <img src={spanishSvg} className="skyline-svg" alt="spanish design" />}
        {language === "Chinese" && <img src={chineseSvg} className="skyline-svg" alt="chinese design" />}
        {language === "Arabic" && <img src={arabicSvg} className="skyline-svg" alt="arabic design" />}
        {language === "French" && <img src={frenchSvg} className="skyline-svg" alt="french design" />}
        {language === "German" && <img src={germanSvg} className="skyline-svg" alt="german design" />}
        {language === "Korean" && <img src={koreanSvg} className="skyline-svg" alt="korean design" />}
        {language === "Hindi" && <img src={hindiSvg} className="skyline-svg" alt="hindi design" />}
        {language === "Portuguese" && <img src={portugueseSvg} className="skyline-svg" alt="portuguese design" />}
        {language === "Afrikaans" && <img src={afrikaansSvg} className="skyline-svg" alt="afrikaans design" />}
        {language === "Vietnamese" && <img src={vietnameseSvg} className="skyline-svg" alt="vietnamese design" />}
        {language === "Japanese" && <img src={japaneseSvg} className="skyline-svg" alt="japanese design" />}
        {language === "Telugu" && <img src={teluguSvg} className="skyline-svg" alt="telugu design" />}
        {language === "Russian" && <img src={russianSvg} className="skyline-svg" alt="russian design" />}
        {language === "Italian" && <img src={italianSvg} className="skyline-svg" alt="italian design" />}
        {language === "Turkish" && <img src={turkishSvg} className="skyline-svg" alt="turkish design" />}
      </div>

      <div className="language-selector-container">
        <select
          name="language"
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          <option value="">Choose your language...</option>
          <option value="Spanish">Spanish</option>
          <option value="Chinese">Chinese</option>
          <option value="German">German</option>
          <option value="French">French</option>
          <option value="Arabic">Arabic</option>
          <option value="Zulu">Zulu</option>
          <option value="Korean">Korean</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Afrikaans">Afrikaans</option>
          <option value="Hindi">Hindi</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Japanese">Japanese</option>
          <option value="Telugu">Telugu</option>
          <option value="Russian">Russian</option>
          <option value="Italian">Italian</option>
          <option value="Turkish">Turkish</option>
        </select>
      </div>

      {(inLobby) ? (
        <p>You are already in a lobby</p>
      ) : (
        <div className="lobby-buttons">
          <button onClick={handleNewPVP} className="button-base neon-bg neon-border neon-text">Create New PVP Lobby</button> 
          <button onClick={handleNewBot} className="button-base neon-bg neon-border neon-text">Create New vs Bot Lobby</button>
        </div>
      )}
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
