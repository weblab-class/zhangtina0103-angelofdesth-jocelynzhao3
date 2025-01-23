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

  useEffect(() => {
    if (userContext.userId) {
      get("/api/whoami").then((userData) => {
        if (userData._id) {
          setUserName(userData.name);
          setUserInfo(userData); // Update userInfo with full user data
        }
      });
    } else {
      setUserInfo({}); // Clear userInfo when user logs out
    }
  }, [userContext.userId]);

  const handleBattleClick = () => { // TODO: put player name in here too?
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
            To play this game, <span className="highlight-cyan">translate</span> the displayed words
            into the <span className="highlight-purple">language</span> of your choice. Each word
            corresponds to a <span className="highlight-green">spell</span> that either{" "}
            <span className="highlight-pink">damages</span> your opponent or{" "}
            <span className="highlight-blue">heals</span> you.{" "}
            <span className="highlight-yellow">Speed</span> and{" "}
            <span className="highlight-orange">accuracy</span> are crucial, so act quickly but
            carefully! Be aware—your opponent can <span className="highlight-red">steal</span> the
            card by typing the correct answer faster than you! Let the battle begin!
          </p>
        </div>
        <div>
          {userContext.userId && (
            <div className="language-selector-container">
              <select
                name="language"
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Select a language to battle in...</option>
                <option value="Spanish">Spanish</option>
                <option value="Chinese">Chinese</option>
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Arabic">Arabic</option>
              </select>
              {!language && <div className="signin-prompt">Please select a language to start battling</div>}
            </div>
          )}
          {userContext.userId && language && (
            <button
              onClick={handleBattleClick}
              className="battle-button button-base neon-bg neon-border neon-text"
            >
              Enter Battle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Start;
