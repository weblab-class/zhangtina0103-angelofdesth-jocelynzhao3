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

  const handleStartClick = () => {
    if (userContext.userId) {
      navigate("/lobbies/");
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
          <Link
            to="/instructions"
            className="profile-button button-base neon-bg neon-border neon-text"
          >
            Instructions
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
        <h1 className="Start-title"> BattleLingo v1</h1>
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
            <button
              onClick={handleStartClick}
              className="battle-button button-base neon-bg neon-border neon-text"
            >
              Start A Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Start;
