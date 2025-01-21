import "../../utilities.css";
import "./Start.css";

import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { LanguageContext } from "../App";
import { get, post } from "../../utilities";

const Start = (props) => {
  const userContext = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);

  useEffect(() => {
    if (userContext.userId) {
      get("/api/whoami").then((userData) => {
        if (userData._id) {
          setUserName(userData.name);
        }
      });
    }
  }, [userContext.userId]);

  const handleSignOut = () => {
    googleLogout();
    userContext.handleLogout();
    setUserName("");
  };

  const handleBattleClick = () => {
    if (userContext.userId) {
      post("/api/startGame", {playerId: userContext.userId, language: language}).then(
        navigate("/battle/")
      );
    }
  };

  return (
    <div>
      <div className="start-battle-container">
        <div className="google-login-container">
          {userContext.userId ? (
            <button
              onClick={handleSignOut}
              className="NavBar-link NavBar-login u-inlineBlock logout-button"
            >
              Sign out {userName}
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
        </div>
        <div>
          <label htmlFor="language-select">Choose a language:</label>
          <select
            name="language"
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {/* language value becomes empty string when selected, add more lan */}
            <option value="">Select a language...</option>
            <option value="Spanish">Spanish</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>
        <button
          onClick={handleBattleClick}
          disabled={!userContext.userId || !language}
          className="battle-button"
        >
          Go to battle!
        </button>
        {!userContext.userId && (
          <div className="signin-prompt">Please sign in to start battling!</div>
        )}
        {userContext.userId && !language && (
          <div className="signin-prompt">Please select a language to start battling!</div>
        )}
      </div>
      <div>
        <p className="profile-section">Make profile section here, need conditional rendering </p>
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
