import "../../utilities.css";
import "./Start.css";

import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { UserContext } from "../App";

const Start = (props) => {
  const userContext = useContext(UserContext);

  return (
    <div>
      <div>
        <GoogleLogin
          text="signin_with"
          onSuccess={props.handleLogin}
          onFailure={(err) => console.log(err)}
          containerProps={{
            className: "NavBar-link NavBar-login u-inlineBlock",
          }}
        />
      </div>
      <Link to="/battle/" className="NavBar-link u-inlineBlock">
        Go to battle!
      </Link>
      <span>
        <p>To play this game... [insert instructions here]</p>
      </span>
    </div>
  );
};

export default Start;
