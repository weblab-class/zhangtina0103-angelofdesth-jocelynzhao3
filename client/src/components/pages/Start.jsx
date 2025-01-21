import "../../utilities.css";
import "./Start.css";

import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { get } from "../../utilities";

const Start = (props) => {
  const userContext = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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
      navigate("/battle/");
    }
  };

  return (
    <div className="Start-container">
      {userContext.userId && (
        <div className="Start-top-bar">
          <button
            onClick={handleSignOut}
            className="NavBar-link NavBar-login u-inlineBlock logout-button"
          >
            Sign out {userName}
          </button>
        </div>
      )}
      <div className="Start-content">
        <h1 className="Start-title">Battle Lingo</h1>
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
        <div className="instructions-container">
          <h2 className="instructions-title">How to Play</h2>
          <p className="instructions-text">
            To play this game, <span className="highlight-cyan">translate</span> the displayed words into the{" "}
            <span className="highlight-purple">language</span> of your choice. Each word corresponds to a{" "}
            <span className="highlight-green">spell</span> that either{" "}
            <span className="highlight-pink">damages</span> your opponent or{" "}
            <span className="highlight-blue">heals</span> you.{" "}
            <span className="highlight-yellow">Speed</span> and{" "}
            <span className="highlight-orange">accuracy</span> are crucial, so act quickly but carefully! Be aware—your opponent can{" "}
            <span className="highlight-red">steal</span> the card by typing the correct answer faster than you! Let the battle begin!
          </p>
        </div>
        {userContext.userId ? (
          <button onClick={handleBattleClick} className="battle-button">
            Enter Battle
          </button>
        ) : (
          <div className="signin-prompt">Sign in to start battling</div>
        )}
        <div>
          <p>Language toggle: Spanish</p>
        </div>
      </div>
    </div>
  );
};

export default Start;
