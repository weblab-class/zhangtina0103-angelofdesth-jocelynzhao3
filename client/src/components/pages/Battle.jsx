import "../../utilities.css";
import "./Start.css";
import { drawCanvas } from "../../canvasManager.js";

import { Link } from "react-router-dom";
import TypeBar from "../modules/Typebar";

const hardcodedCards = [
    {prompt: "Salz", target: "salt", effect: "deal 10 damage"},
    {prompt: "Wasser", target: "water", effect: "deal 10 damage"},
    {prompt: "Unterwegs", target: "underway", effect: "deal 10 damage"}
];


const Battle = (props) => {
  return (
    <>
      <p>You have reached the battle page</p>
      <div>
        <TypeBar cards={hardcodedCards}/>
      </div>
      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </>
  );
};

export default Battle;
