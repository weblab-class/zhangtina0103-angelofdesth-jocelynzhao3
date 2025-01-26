import "../../utilities.css";
import "./BattleProfile.css";

import React, { useContext, useState, useEffect } from "react";
import { UserInfoContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BattleProfile = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [showAllResults, setShowAllResults] = useState(false);
  const INITIAL_RESULTS_COUNT = 10;

  const [countdown, setCountdown] = useState(3);
  const REDIRECT_DELAY = 3000; // 3 seconds delay before redirect
  const navigate = useNavigate();

  const [languageStats, setLanguageStats] = useState(null);
  const [winRate, setWinRate] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  // Fetch latest user info on component mount and when needed
  useEffect(() => {
    get("/api/userinfo").then((userData) => {
      if (userData._id) {
        console.log("Fetching latest user data");
        setUserInfo(userData);

        // Calculate win rate and total games from battle log
        if (userData.log && userData.log.length > 0) {
          const total = userData.log.length;
          const wins = userData.log.filter((game) => game.Result === "Win").length;
          const winRatePercent = Math.round((wins / total) * 100);
          setWinRate(winRatePercent);
          setTotalGames(total);
        }

        // Calculate language stats
        const stats = userData.log.reduce((acc, entry) => {
          const language = entry.Language;
          acc[language] = (acc[language] || 0) + 1;
          return acc;
        }, {});

        // Convert to Chart.js format
        const chartData = {
          labels: Object.keys(stats),
          datasets: [
            {
              data: Object.values(stats),
              backgroundColor: [
                "rgba(0, 255, 255, 0.7)",  // Cyan
                "rgba(255, 0, 255, 0.7)",  // Magenta
                "rgba(0, 255, 128, 0.7)",  // Neon Green
                "rgba(255, 0, 128, 0.7)",  // Neon Pink
                "rgba(128, 0, 255, 0.7)",  // Neon Purple
                "rgba(0, 128, 255, 0.7)",  // Neon Blue
              ],
              hoverBackgroundColor: [
                "rgba(0, 255, 255, 0.9)",  // Cyan
                "rgba(255, 0, 255, 0.9)",  // Magenta
                "rgba(0, 255, 128, 0.9)",  // Neon Green
                "rgba(255, 0, 128, 0.9)",  // Neon Pink
                "rgba(128, 0, 255, 0.9)",  // Neon Purple
                "rgba(0, 128, 255, 0.9)",  // Neon Blue
              ],
              borderWidth: 0,
              hoverOffset: 20,
              cutout: 0,
              radius: "100%"
            },
          ],
        };
        setLanguageStats(chartData);
      } else {
        setUserInfo({}); // Clear userInfo if no user data
      }
    });
  }, []); // Run once on component mount

  const displayedResults = showAllResults
    ? userInfo?.log
    : userInfo?.log?.slice(0, INITIAL_RESULTS_COUNT);

  // Redirect effect for non-logged in users
  useEffect(() => {
    if (!userInfo?.name) {
      const redirectTimer = setTimeout(() => {
        navigate("/");
      }, REDIRECT_DELAY);

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup timers if component unmounts
      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return (
      <div className="BattleEnd-container">
        <div className="BattleEnd-userinfo" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#ff4d4d" }}>Access Denied</h2>
          <p>Please log in to view your battle profile.</p>
          <p>Redirecting to start page in {countdown} seconds...</p>
          <Link to="/" className="BattleEnd-button" style={{ marginTop: "20px" }}>
            Go to Start Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="BattleEnd-container">
      <div>
        <h1>Profile</h1>
      </div>
      <div className="BattleEnd-userinfo">
        <h2>Player Information</h2>
        <div className="BattleEnd-header">
          <div className="BattleEnd-player-info">
            <div className="BattleEnd-player-name-and-avatar">
              <div className="avatar-container">
                <img
                  src={userInfo.avatarURL || "/default-avatar.png"}
                  alt={`${userInfo.name}'s avatar`}
                  className="BattleEnd-avatar"
                />
              </div>
            </div>
            <div className="BattleEnd-player-details">
              <p className="player-name">{userInfo.name}</p>
              <p className="stats-header">Stats</p>
              <p className="elo">ELO Rating: {userInfo.elo}</p>
              <p className="games">Games: {totalGames}</p>
              <p className="win-rate">Win Rate: {winRate}%</p>
            </div>
          </div>

          {/* Language Distribution Chart */}
          <div className="BattleEnd-chart-container">
            <div className="BattleEnd-chart-title">Language Breakdown</div>
            {languageStats ? (
              <Pie
                data={languageStats}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || "";
                          const value = context.raw;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${percentage}%`;
                        },
                      },
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleFont: {
                        size: 11,
                        family: "'Orbitron', sans-serif",
                      },
                      bodyFont: {
                        size: 11,
                        family: "'Orbitron', sans-serif",
                      },
                      padding: 6,
                      cornerRadius: 4,
                      displayColors: true,
                    },
                  },
                  layout: {
                    padding: 20,
                  },
                  elements: {
                    arc: {
                      borderWidth: 0,
                    }
                  },
                  hover: {
                    mode: "nearest",
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                className="BattleEnd-chart"
              />
            ) : (
              <p>No language data available</p>
            )}
          </div>

          <Link to="/" className="BattleEnd-button">
            Back to start page!
          </Link>
        </div>

        <h3>Battle History</h3>
        <div className="BattleEnd-log">
          {displayedResults && displayedResults.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Result</th>
                    <th>Opponent</th>
                    <th>Language</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedResults.map((entry, index) => (
                    <tr key={index} className={index === 0 ? "BattleEnd-recent-battle" : ""}>
                      <td>
                        {index === 0 && <span className="BattleEnd-recent-label">Latest</span>}
                        <span className={`result-text ${entry.Result === "Win" ? "win" : "lose"}`}>
                          {entry.Result}
                        </span>
                      </td>
                      <td>{entry.Opponent}</td>
                      <td>{entry.Language}</td>
                      <td>{entry.Date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userInfo.log?.length > INITIAL_RESULTS_COUNT && !showAllResults && (
                <button className="BattleEnd-show-more" onClick={() => setShowAllResults(true)}>
                  Show More Results ({userInfo.log.length - INITIAL_RESULTS_COUNT} more)
                </button>
              )}
            </>
          ) : (
            <p>No battle history yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleProfile;
