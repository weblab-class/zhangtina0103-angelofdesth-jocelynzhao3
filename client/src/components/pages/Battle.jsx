import "../../utilities.css";
import "./Start.css";

import { Link } from "react-router-dom";

const Battle = (props) => {
  return (
    <>
      <p>You have reached the battle page</p>
      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </>
  );
};

export default Battle;
