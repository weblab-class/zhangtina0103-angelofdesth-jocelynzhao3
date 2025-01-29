import "../../utilities.css";
import "./Lobby.css";
import "./BotLobbyCreation.css";

import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { LanguageContext } from "../App";
import { UserContext } from "../App";
import { UserInfoContext } from "../App";
import { post } from "../../utilities";

const BotLobbyCreation = () => {
  const userContext = useContext(UserContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const navigate = useNavigate();

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const handleStartClick = (difficulty) => {
    console.log(userContext);
    post("/api/startBotGame", {
      p1: userInfo._id,
      language: language,
      difficulty: difficulty,
    }).then(navigate("/battle/"));
  };

  return (
    <div className="bot-container">
      <h3>New Game vs. Bot</h3>
      <div>
        <select
          name="language"
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bot-language-select"
        >
          {/* language value becomes empty string when selected, add more lan */}
          <option value="">Select a language...</option>
          <option value="Spanish">Spanish</option>
          <option value="Chinese">Chinese</option>
          <option value="German">German</option>
          <option value="French">French</option>
          <option value="Arabic">Arabic</option>
        </select>

        {language && (
          <>
            <p className="difficulty-text">Choose your difficulty level:</p>
            <div className="difficulty-buttons">
              <button
                onClick={() => {
                  handleStartClick(1);
                  setSelectedDifficulty(1);
                }}
                className={`bot-create-button ${
                  selectedDifficulty === 1 ? "selected" : ""
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => {
                  handleStartClick(2);
                  setSelectedDifficulty(2);
                }}
                className={`bot-create-button ${
                  selectedDifficulty === 2 ? "selected" : ""
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => {
                  handleStartClick(3);
                  setSelectedDifficulty(3);
                }}
                className={`bot-create-button ${
                  selectedDifficulty === 3 ? "selected" : ""
                }`}
              >
                Hard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BotLobbyCreation;
