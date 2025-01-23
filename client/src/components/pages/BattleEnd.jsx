import "../../utilities.css";
import "./BattleEnd.css";

import React, { useContext, useEffect } from "react";
import { UserInfoContext } from "../App";
import { Link } from "react-router-dom";
import { get } from "../../utilities";

const BattleEnd = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);

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

  console.log("BattleEnd userInfo", userInfo);

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
        <p>Name: {userInfo.name}</p>
        <p>ELO Rating: {userInfo.elo}</p>

        <h3>Battle History</h3>
        <div className="BattleEnd-log">
          {userInfo.log && userInfo.log.length > 0 ? (
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
                {userInfo.log.map((entry, index) => (
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
          ) : (
            <p>No battle history yet</p>
          )}
        </div>
      </div>
      <div className="BattleEnd-navigation">
        <Link to="/" className="BattleEnd-button">
          Back to start page!
        </Link>
      </div>
    </div>
  );
};

export default BattleEnd;
