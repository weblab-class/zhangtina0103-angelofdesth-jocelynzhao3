import "../../utilities.css";
import "./Start.css";

import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { LanguageContext } from "../App";
import { UserInfoContext } from "../App";
import { get } from "../../utilities";

const Start = (props) => {
  const userContext = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);

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

  const handleSignOut = () => {
    googleLogout();
    userContext.handleLogout();
    setUserName("");
    setUserInfo({}); // Clear userInfo on sign out
  };

  const handleBattleClick = () => {
    if (userContext.userId) {
      navigate("/battle/");
    }
  };

  const handlePVPClick = () => {
    if (userContext.userId) {
      navigate("/pvp/");
    }
  };

  return (
    <div>
      <div className="start-battle-container">
        {userContext.userId ? (
          <button
            onClick={handleSignOut}
            className="NavBar-link NavBar-login u-inlineBlock logout-button"
          >
            Sign out
          </button>
        ) : (
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
        <div>
          <label htmlFor="language-select">Choose a language:</label>
          <select
            name="language"
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Select a language...</option>
            <option value="Spanish">Spanish</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
        <div className="battle-buttons-container">
          <button
            onClick={handleBattleClick}
            disabled={!userContext.userId || !language}
            className="battle-button"
          >
            Go to bot battle!
          </button>
          <button
            onClick={handlePVPClick}
            disabled={!userContext.userId || !language}
            className="battle-button"
          >
            Go to PVP!
          </button>
        </div>
        {!userContext.userId && (
          <div className="signin-prompt">Please sign in to start battling!</div>
        )}
        {userContext.userId && !language && (
          <div className="signin-prompt">Please select a language to start battling!</div>
        )}
      </div>
      <div className="instructions-container">
        {userContext.userId && userInfo && (
          <div className="profile-info">
            <p>Welcome, {userInfo.name}!</p>
            <p>ELO Rating: {userInfo.elo || 1}</p>
            <p>Battles Fought: {userInfo.log?.length || 0}</p>
          </div>
        )}
      </div>
      <div className="instructions-container">
        <h2 className="instructions-title">How to Play</h2>
        <p className="instructions-text">
          To play this game translate the displayed words into the language of your choice. Each
          word has a corresponding spell to damage your opponent or heal yourself. Accuracy and
          speed matter, so be quick but correct! Your opponent can take the card if they type the
          correct answer faster than you!
        </p>
      </div>
    </div>
  );
};

export default Start;
