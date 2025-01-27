import "../../utilities.css";
import "./Start.css";
import cityscapeSvg from "../../images/cityscape.svg";
import NewcityscapeSvg from "../../images/newCityscape.svg";

import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { LanguageContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";
import LoadingOverlay from "../modules/LoadingOverlay";

const Start = (props) => {
  const userContext = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const [showEffects, setShowEffects] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const spellEffects = [
    {
      icon: "",
      name: "Attack",
      description: "Deal damage with specified HP amount to your opponent",
    },
    { icon: "", name: "Heal", description: "Restore HP to yourself" },
    { icon: "", name: "Life Stealer", description: "Both attack your opponent and heal yourself" },
    { icon: "", name: "3x", description: "Triple the effect of your next spell" },
    { icon: "", name: "Freeze", description: "Disable your opponent's keyboard for 3 seconds" },
  ];

  // not needed?
  // useEffect(() => {
  //   if (userContext.userId) {
  //     get("/api/whoami").then((userData) => {
  //       if (userData._id) {
  //         setUserName(userData.name);
  //         setUserInfo(userData); // Update userInfo with full user data
  //         console.log("user data here " + userData);
  //       }
  //     });
  //   } else {
  //     setUserInfo({}); // Clear userInfo when user logs out
  //   }
  // }, [userContext.userId]);

  const handleBattleClick = () => {
    if (userContext.userId) {
      setShowOverlay(true); // Show the overlay first

      // Start the game setup
      post("/api/startGame", { playerId: userContext.userId, language: language }).then(() => {
        // Wait for 4 seconds (3,2,1,GO!) before navigating
        setTimeout(() => {
          navigate("/battle/");
        }, 4000);
      });
    }
  };

  return (
    <>
      {showOverlay && <LoadingOverlay />}
      <div className="Start-container">
        <img src={NewcityscapeSvg} alt="Cityscape" className="cityscape-background" />
        <div className="Start-content">
          {userContext.userId && (
            <div className="Start-top-bar">
              <div className="profile-section">
                {userInfo?.picture && (
                  <Link to="/battleProfile" className="profile-picture-container">
                    <img
                      src={userInfo.picture}
                      alt={userInfo.name}
                      className="profile-picture"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          userInfo.name
                        )}&background=0D8ABC&color=fff`;
                      }}
                    />
                  </Link>
                )}
              </div>
              <Link to="/instructions" className="instructions-button">
                ❓
              </Link>
              <Link to="/leaderboard" className="leaderboard-button">
                🏆
              </Link>
              <button
                onClick={userContext.handleLogout}
                className="logout-button button-base neon-bg neon-border neon-text"
              >
                Sign out
              </button>
            </div>
          )}
          <h1 className="Start-title"> BattleLingo </h1>
          {!userContext.userId && <div className="signin-prompt">Sign in to start battling</div>}

          <div className="google-login-container">
            {!userContext.userId && (
              <GoogleLogin
                onSuccess={userContext.handleLogin}
                onFailure={(err) => console.log(err)}
                useOneTap
                type="standard"
                theme="filled_black"
                shape="rectangular"
                locale="en"
                text="signin_with"
              />
            )}
          </div>

          {showEffects && (
            <div className="effects-modal">
              <div className="effects-content">
                <h2>Spell Effects</h2>
                <div className="effects-grid">
                  {spellEffects.map((effect, index) => (
                    <div key={index} className="effect-item">
                      <div className="effect-icon">{effect.icon}</div>
                      <div className="effect-name">{effect.name}</div>
                      <div className="effect-description">{effect.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div>
            {userContext.userId && (
              <div className="bottom-content-wrapper">
                <div className="language-selector-container">
                  <select
                    name="language"
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="">Choose your language...</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Chinese">Chinese</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
                <div className={`battle-button-container ${language ? "visible" : ""}`}>
                  <button
                    onClick={handleBattleClick}
                    className="battle-button button-base neon-bg neon-border neon-text"
                  >
                    Enter Battle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Start;
