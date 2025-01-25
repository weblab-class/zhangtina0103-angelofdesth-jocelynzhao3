import "../../utilities.css";
import "./BattleEnd.css";

import React, { useContext, useEffect, useState } from "react";
import { UserInfoContext } from "../App";
import { Link } from "react-router-dom";
import { get } from "../../utilities";

const BattleEnd = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [showAllResults, setShowAllResults] = useState(false);
  const INITIAL_RESULTS_COUNT = 10;

  // Fetch latest user info on component mount and when needed
  useEffect(() => {
    get("/api/userinfo").then((userData) => {
      if (userData._id) {
        console.log("Fetching latest user data");
        setUserInfo(userData);
      } else {
        setUserInfo({}); // Clear userInfo if no user data
      }
    });
  }, []); // Run once on component mount

  const displayedResults = showAllResults 
    ? userInfo.log 
    : userInfo.log?.slice(0, INITIAL_RESULTS_COUNT);

  if (!userInfo || !userInfo.name) {
    return <div>Loading...</div>;
  }

  return (
    <div className="BattleEnd-container">
      <div>
        <h1>Battle End</h1>
      </div>
      <div className="BattleEnd-userinfo">
        <h2>Player Information</h2>
        <div className="BattleEnd-header">
          <div className="BattleEnd-player-info">
            <img 
              src={userInfo.avatarURL || "/default-avatar.png"} 
              alt={`${userInfo.name}'s avatar`}
              className="BattleEnd-avatar"
            />
            <div className="BattleEnd-player-details">
              <p>Name: {userInfo.name}</p>
              <p className="elo">ELO Rating: {userInfo.elo}</p>
            </div>
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
                        {entry.Result}
                      </td>
                      <td>{entry.Opponent}</td>
                      <td>{entry.Language}</td>
                      <td>{entry.Date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userInfo.log.length > INITIAL_RESULTS_COUNT && !showAllResults && (
                <button 
                  className="BattleEnd-show-more" 
                  onClick={() => setShowAllResults(true)}
                >
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

export default BattleEnd;
