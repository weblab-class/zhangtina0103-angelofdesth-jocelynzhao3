import "../../utilities.css";
import "./BattleEnd.css";

import React, { useContext, useEffect } from "react";
import { UserInfoContext } from "../App";
import { Link } from "react-router-dom";
import { get } from "../../utilities";

const BattleEnd = (props) => {
  const { userInfo, setUserInfo } = useContext(UserInfoContext);

  // Fetch latest user info whenever userInfo changes
  useEffect(() => {
    if (userInfo && userInfo._id) {
      get("/api/whoami").then((userData) => {
        if (userData._id) {
          console.log("getting new new data");
          setUserInfo(userData); // Update userInfo with full user data
        }
      });
    } else {
      setUserInfo({}); // Clear userInfo when user logs out
    }
  }, [userInfo.elo]);

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
        <p>Google ID: {userInfo.googleid}</p>
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
                  <tr key={index}>
                    <td>{entry.Result}</td>
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
