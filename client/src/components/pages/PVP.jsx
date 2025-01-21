import React from "react";
import { Link } from "react-router-dom";

import "./PVP.css";

const PVP = () => {
  return (
    <div className="pvp-container">
      <h1>Player vs Player</h1>
      <h2>Coming Soon!</h2>
      <Link to="/" className="back-button">
        Back to Start
      </Link>
    </div>
  );
};

export default PVP;
