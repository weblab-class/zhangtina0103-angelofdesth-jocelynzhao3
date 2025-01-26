import React, { useState, useEffect, useContext } from "react";
import { get } from "../../utilities";
import "./Leaderboard.css";
import { UserInfoContext } from "../App.jsx";

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
  const { userInfo } = useContext(UserInfoContext);

  useEffect(() => {
    get("/api/leaderboard").then((userList) => {
      // Process stats and sort by ELO
      const processedUsers = userList.map(processUserStats).sort((a, b) => b.elo - a.elo);
      setUsers(processedUsers);
    });
  }, []);

  // Find user's rank
  const userRank = userInfo ? users.findIndex((user) => user._id === userInfo._id) + 1 : -1;

  return (
    <div className="Leaderboard-container">
      <h1>Leaderboard</h1>
      {userRank > 0 && <div className="Leaderboard-userRank">Your Rank: #{userRank}</div>}
      <div className="Leaderboard-table">
        <div className="Leaderboard-header">
          <div className="Leaderboard-rank">Rank</div>
          <div className="Leaderboard-name">Name</div>
          <div className="Leaderboard-elo">ELO</div>
          <div className="Leaderboard-games">Games</div>
          <div className="Leaderboard-winrate">Win Rate</div>
          <div className="Leaderboard-language">Top Language</div>
        </div>
        {users.map((user, index) => (
          <div
            key={user._id}
            className={`Leaderboard-row ${
              user._id === userInfo?._id ? "Leaderboard-row-highlight" : ""
            }`}
          >
            <div className="Leaderboard-rank">{index + 1}</div>
            <div className="Leaderboard-name">{user.name}</div>
            <div className="Leaderboard-elo">{user.elo}</div>
            <div className="Leaderboard-games">{user.log.length}</div>
            <div className="Leaderboard-winrate">{user.winRate}</div>
            <div className="Leaderboard-language">{user.mostPlayedLanguage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
