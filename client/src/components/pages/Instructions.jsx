import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Instructions.css";
import { UserInfoContext, UserContext } from "../App.jsx";
import doorIcon from "../../assets/door.png";
import questionIcon from "../../assets/question.png";
import trophyIcon from "../../assets/trophy.png";
import houseIcon from "../../assets/house.png";

const Instructions = () => {
  const { userInfo } = useContext(UserInfoContext);
  const { handleLogout } = useContext(UserContext);

  return (
    <div className="Instructions-container">
      <Link to="/" className="back-to-start-link">
        <img src={houseIcon} alt="home" className="house-icon" />
      </Link>
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
        <button onClick={handleLogout} className="logout-button">
          <img src={doorIcon} alt="sign out" className="door-icon" />
        </button>
      </div>

      <div className="Instructions-content">
        <div className="Start-container">
          <div className="instructions-page-container">
            <h2 className="instructions-title">How to Play</h2>
            <div className="instructions-container">
              <p className="instructions-text">
                To play this game, <span className="highlight-cyan">translate</span> the displayed
                words into the <span className="highlight-purple">language</span> of your choice.
                Each word corresponds to a <span className="highlight-blue">spell</span>, such as{" "}
                <span className="highlight-red">damaging</span> your opponent or{" "}
                <span className="highlight-green">healing</span> you.{" "}
                <span className="highlight-yellow">Speed</span> and{" "}
                <span className="highlight-orange">accuracy</span> are crucial—your opponent can{" "}
                <span className="highlight-purple">steal</span> the spell by typing the correct
                answer faster than you! Let the battle begin!
              </p>
            </div>

            <h2 className="instructions-title">Spell Types</h2>
            <div className="instructions-container">
              <p className="instructions-text">
                <span className="highlight-red">Attack</span> - Damage specified HP to your opponent
              </p>
              <p className="instructions-text">
                <span className="highlight-green">Heal</span> - Restore specified HP to yourself
              </p>
              <p className="instructions-text">
                <span className="highlight-purple">Lifesteal</span> - Deal damage your opponent and
                heal yourself
              </p>
              <p className="instructions-text">
                <span className="highlight-blue">Freeze</span> - Disable your opponent's keyboard
                for 3 seconds
              </p>
              {/* <p className="instructions-text">
                <span className="highlight-brown">Block</span> - Gain 3 seconds of protection of your
                opponent's next attack
              </p> */}
              <p className="instructions-text">
                <span className="highlight-orange">3x</span> - Triple the effect of the next spell
                (CAUTION: this goes both ways!)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
