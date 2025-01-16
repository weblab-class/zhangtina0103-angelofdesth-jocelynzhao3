import "../../utilities.css";
import "./Start.css";

import { Link } from "react-router-dom";
import TypeBar from "../modules/Typebar";

const Battle = (props) => {
  return (
    <>
      <p>You have reached the battle page</p>
      <div>
        <TypeBar />
      </div>
      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </>
  );
};

export default Battle;
