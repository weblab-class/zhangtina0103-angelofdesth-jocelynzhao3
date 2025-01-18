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
    <div>
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
      <button onClick={handleBattleClick} disabled={!userContext.userId} className="battle-button">
        Go to battle!
      </button>
      {!userContext.userId && (
        <div className="signin-prompt">Please sign in to start battling!</div>
      )}
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
