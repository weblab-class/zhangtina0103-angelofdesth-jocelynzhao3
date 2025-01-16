import "../../utilities.css";
import "./BattleEnd.css";

import { Link } from "react-router-dom";

const BattleEnd = (props) => {
  return (
    <div>
      <div>
        <p>You have reached the battle ending page</p>
      </div>
      <div>
        <Link to="/">Back to start page!</Link>
      </div>
    </div>
  );
};

export default BattleEnd;
