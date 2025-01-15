import "../../utilities.css";
import "./BattleEnd.css";

import { Link } from "react-router-dom";

const BattleEnd = (props) => {
  return (
    <>
      <p>You have reached the battle ending page</p>
      <Link to="/" className="NavBar-link u-inlineBlock">
        Back to start page!
      </Link>
    </>
  );
};

export default BattleEnd;
