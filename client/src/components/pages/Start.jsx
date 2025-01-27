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
        <div className="svg-wrapper">
          {language === "Zulu" && <img src={zuluSvg} className="skyline-svg" alt="zulu design" />}
          {language === "Spanish" && (
            <img src={spanishSvg} className="skyline-svg" alt="spanish design" />
          )}
          {language === "Chinese" && (
            <img src={chineseSvg} className="skyline-svg" alt="chinese design" />
          )}
          {language === "Arabic" && (
            <img src={arabicSvg} className="skyline-svg" alt="arabic design" />
          )}
          {language === "French" && (
            <img src={frenchSvg} className="skyline-svg" alt="french design" />
          )}
          {language === "German" && (
            <img src={germanSvg} className="skyline-svg" alt="german design" />
          )}
          {language === "Korean" && (
            <img src={koreanSvg} className="skyline-svg" alt="korean design" />
          )}
          {language === "Hindi" && (
            <img src={hindiSvg} className="skyline-svg" alt="hindi design" />
          )}
          {language === "Portuguese" && (
            <img src={portugueseSvg} className="skyline-svg" alt="portuguese design" />
          )}
          {language === "Afrikaans" && (
            <img src={afrikaansSvg} className="skyline-svg" alt="afrikaans design" />
          )}
          {language === "Vietnamese" && (
            <img src={vietnameseSvg} className="skyline-svg" alt="vietnamese design" />
          )}
          {language === "Japanese" && (
            <img src={japaneseSvg} className="skyline-svg" alt="japanese design" />
          )}
          {language === "Telugu" && (
            <img src={teluguSvg} className="skyline-svg" alt="telugu design" />
          )}
          {language === "Russian" && (
            <img src={russianSvg} className="skyline-svg" alt="russian design" />
          )}
          {language === "Italian" && (
            <img src={italianSvg} className="skyline-svg" alt="italian design" />
          )}
          {language === "Turkish" && (
            <img src={turkishSvg} className="skyline-svg" alt="turkish design" />
          )}
        </div>
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
              <div className="icon-container">
                <Link to="/instructions" className="instructions-button">
                  <img src={questionIcon} alt="question mark" className="question-icon" />
                </Link>
                <Link to="/leaderboard" className="leaderboard-button">
                  <img src={trophyIcon} alt="trophy" className="trophy-icon" />
                </Link>
                <button
                  onClick={userContext.handleLogout}
                  className="logout-button"
                  aria-label="Sign Out"
                >
                  <img src={doorIcon} alt="sign out" className="door-icon" />
                </button>
              </div>
            </div>
          )}
          <h1 className="Start-title">
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                {typedText}
                {showCursor && <span className="cursor">|</span>}
              </div>
            </div>
          </h1>

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
