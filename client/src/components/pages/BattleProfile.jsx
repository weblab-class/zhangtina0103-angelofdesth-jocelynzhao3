import "../../utilities.css";
import "./BattleProfile.css";

import React, { useContext, useState, useEffect, Component } from "react";
import { UserInfoContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Chart Error Boundary Component
class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null; // Return nothing if there's an error
    }
    return this.props.children;
  }
}

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
                "#00ffff", // Cyan
                "#ff00ff", // Magenta
                "#00ff00", // Neon Green
                "#ff3366", // Neon Pink
                "#9933ff", // Neon Purple
                "#ff9933", // Neon Orange
                "#ffff00", // Neon Yellow
                "#33ccff", // Light Blue
                "#ff3300", // Neon Red
                "#66ff66", // Light Green
              ],
              hoverBackgroundColor: [
                "#4dffff", // Cyan
                "#ff4dff", // Magenta
                "#4dff4d", // Neon Green
                "#ff6699", // Neon Pink
                "#b366ff", // Neon Purple
                "#ffb366", // Neon Orange
                "#ffff4d", // Neon Yellow
                "#66e0ff", // Light Blue
                "#ff664d", // Neon Red
                "#99ff99", // Light Green
              ],
              borderWidth: 0,
              hoverOffset: 20,
              cutout: 0,
              radius: "100%",
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();

    return `${formattedHours}:${formattedMinutes} ${ampm} on ${month} ${day}`;
  };

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
        <h1 className="BattleEnd-title">Battle Profile</h1>
      </div>
      <div className="BattleEnd-userinfo">
        <h2>Player Information</h2>
        <div className="BattleEnd-header">
          <div className="BattleEnd-player-info">
            <div className="BattleEnd-player-name-and-avatar">
              <div className="avatar-container">
                <img
                  src={userInfo.picture || "/default-avatar.png"}
                  alt={userInfo.name}
                  className="BattleEnd-avatar"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userInfo.name
                    )}&background=0D8ABC&color=fff`;
                  }}
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
            {languageStats ? (
              <ChartErrorBoundary>
                <div className="BattleEnd-chart-title">Language Breakdown</div>
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
                      },
                    },
                    hover: {
                      mode: "nearest",
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                  className="BattleEnd-chart"
                />
              </ChartErrorBoundary>
            ) : (
              null
            )}
          </div>

          <Link to="/" className="BattleEnd-button">
            Back to start page!
          </Link>
        </div>

        <h3>Battle History</h3>
        <div className="BattleEnd-log">
          <table>
            <thead>
              <tr>
                <th>Result</th>
                <th>Opponent</th>
                <th>Language</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {displayedResults?.map((entry, index) => (
                <tr key={index} className={index === 0 ? "BattleEnd-recent-battle" : ""}>
                  <td>
                    <span className={`result-text ${entry.Result === "Win" ? "win" : "lose"}`}>
                      {entry.Result}
                    </span>
                  </td>
                  <td>{entry.Opponent}</td>
                  <td>{entry.Language}</td>
                  <td>{formatDate(entry.Date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {userInfo?.log?.length > INITIAL_RESULTS_COUNT && (
          <button onClick={() => setShowAllResults(!showAllResults)} className="BattleEnd-button">
            {showAllResults ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BattleProfile;
