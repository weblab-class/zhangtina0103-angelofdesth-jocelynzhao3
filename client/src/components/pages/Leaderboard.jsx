import React, { useState, useEffect, useContext } from "react";
import { get } from "../../utilities";
import "./Leaderboard.css";
import { UserInfoContext } from "../App.jsx";
import { Link } from "react-router-dom";
import doorIcon from "../../assets/door.png";
import questionIcon from "../../assets/question.png";
import trophyIcon from "../../assets/trophy.png";
import houseIcon from "../../assets/house.png";

const processUserStats = (user) => {
  const log = user.log || [];

  // Calculate win rate
  const wins = log.filter((game) => game.Result === "Win").length;
  const winRate = log.length > 0 ? ((wins / log.length) * 100).toFixed(1) : "0.0";

  // Find most common language
  const languageCounts = log.reduce((acc, game) => {
    acc[game.Language] = (acc[game.Language] || 0) + 1;
    return acc;
  }, {});

  const mostCommonLanguage = Object.entries(languageCounts).reduce(
    (max, [lang, count]) => (!max || count > max[1] ? [lang, count] : max),
    null
  );

  return {
    ...user,
    winRate: `${winRate}%`,
    mostPlayedLanguage: mostCommonLanguage ? mostCommonLanguage[0] : "N/A",
  };
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);

  useEffect(() => {
    get("/api/leaderboard").then((userList) => {
      // Process stats and sort by ELO
      const processedUsers = userList.map(processUserStats).sort((a, b) => b.elo - a.elo);
      console.log("Processed users:", processedUsers); // Debug log
      setUsers(processedUsers);
    });
  }, []);

  // Find user's rank
  const userRank = userInfo ? users.findIndex((user) => user._id === userInfo._id) + 1 : -1;

  return (
    <div className="Start-container">
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
        <button onClick={() => setUserInfo(null)} className="logout-button">
          <img src={doorIcon} alt="sign out" className="door-icon" />
        </button>
      </div>
      <div className="Leaderboard-container">
        <h1>Leaderboard</h1>
        {userRank > 0 && <div className="Leaderboard-userRank">Your Rank: #{userRank}</div>}
        <table className="Leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>ELO</th>
              <th>Win Rate</th>
              <th>Most Played</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className={user._id === userInfo?._id ? "highlight" : ""}>
                <td className="Leaderboard-rank">#{index + 1}</td>
                <td className="Leaderboard-name">{user.name}</td>
                <td className="Leaderboard-elo" data-value={user.elo}>
                  {user.elo}
                </td>
                <td className="Leaderboard-winrate" data-value={parseFloat(user.winRate) || 0}>
                  {user.winRate}
                </td>
                <td className="Leaderboard-language" data-value={user.mostPlayedLanguage}>
                  {user.mostPlayedLanguage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
