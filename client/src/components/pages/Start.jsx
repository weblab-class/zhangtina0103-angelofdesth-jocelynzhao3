import "../../utilities.css";
import "./Start.css";

import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { LanguageContext } from "../App";
import { UserInfoContext } from "../App";
import { get, post } from "../../utilities";

const Start = (props) => {
  const userContext = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const [showEffects, setShowEffects] = useState(false);

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
    // TODO: put player name in here too?
    if (userContext.userId) {
      post("/api/startGame", { playerId: userContext.userId, language: language }).then(
        navigate("/battle/")
      );
    }
  };

  return (
    <div className="Start-container">
      {userContext.userId && (
        <div className="Start-top-bar">
          <Link
            to="/battleProfile"
            className="profile-button button-base neon-bg neon-border neon-text"
          >
            Profile
          </Link>
          <button
            onClick={userContext.handleLogout}
            className="logout-button button-base neon-bg neon-border neon-text"
          >
            Sign out
          </button>
        </div>
      )}
      <div className="Start-content">
        <h1 className="Start-title"> BattleLingo </h1>

        <div className="main-content-wrapper">
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
            {!userContext.userId && <div className="signin-prompt">Sign in to start battling</div>}
          </div>

          <div className="instructions-container">
            <h2 className="instructions-title">How to Play</h2>
            <p className="instructions-text">
              <span className="highlight-cyan">Translate</span> words into your chosen{" "}
              <span className="highlight-purple">language</span> to cast powerful{" "}
              <span className="highlight-green">spells</span>. Each spell has a unique effect - from{" "}
              <span className="highlight-pink">attacking</span>, to{" "}
              <span className="highlight-blue">healing</span>, to{" "}
              <span className="highlight-red">freezing</span> your opponent.{" "}
              <span className="highlight-yellow">Speed</span> matters - your opponent can steal
              spells by translating faster! Defeat your opponent by destroying their HP to 0 before
              they do to you!{" "}
            </p>
            <button
              className="see-effects-btn neon-text"
              onClick={() => setShowEffects(!showEffects)}
            >
              {showEffects ? "Hide Spells" : "See Spells"}
            </button>
          </div>

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

        {showEffects && (
          <>
            <div className="effects-overlay" onClick={() => setShowEffects(false)} />
            <div className="effects-container">
              <button className="close-effects-btn" onClick={() => setShowEffects(false)}>
                ×
              </button>
              <h2 className="instructions-title">Spell Types</h2>
              <div className="effects-list">
                <p className="effect-item">
                  <span className="highlight-pink">Attack</span> - Deal damage with specified HP
                  amount to your opponent
                </p>
                <p className="effect-item">
                  <span className="highlight-blue">Heal</span> - Restore HP to yourself
                </p>
                <p className="effect-item">
                  <span className="highlight-purple">Life Stealer</span> - Both attack your opponent
                  and heal yourself
                </p>
                <p className="effect-item">
                  <span className="highlight-yellow">2x</span> - Double the effect of your next
                  spell
                </p>
                <p className="effect-item">
                  <span className="highlight-red">Freeze</span> - Disable your opponent's keyboard
                  for 5 seconds
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Start;
