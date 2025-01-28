import "../../utilities.css";
import "./Start.css";
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
import questionIcon from "../../assets/question.png";
import trophyIcon from "../../assets/trophy.png";
import doorIcon from "../../assets/door.png";

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
  const { userInfo } = useContext(UserInfoContext);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
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

  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const text = "BattleLingo";

  useEffect(() => {
    let currentChar = 0;
    const typeChar = () => {
      if (currentChar < text.length) {
        setTypedText(text.slice(0, currentChar + 1));
        currentChar++;
        setTimeout(typeChar, 200);
      } else {
        setShowCursor(false); // Hide cursor after typing is complete
      }
    };
    typeChar();
  }, []);

  const handleStartClick = () => {
    if (userContext.userId) {
      navigate("/lobbies/");
    }
  };

  return (
    <div className="Start-container">
      {userContext.userId && (
        <div className="Start-top-bar">
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
                  userInfo?.picture ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                alt="profile"
                className="profile-icon"
              />
            </Link>
            <button onClick={userContext.handleLogout} className="logout-button">
              <img src={doorIcon} alt="sign out" className="door-icon" />
            </button>
          </div>
        </div>
      )}
      <div className="Start-content">
        <h1 className="Start-title"> BattleLingo v6</h1>
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
            <button onClick={handleStartClick} className="battle-button">
              Start A Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Start;
