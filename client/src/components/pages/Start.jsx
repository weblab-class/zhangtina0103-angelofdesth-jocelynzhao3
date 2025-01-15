import "../../utilities.css";
import "./Start.css";

import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import TypeBar from "../modules/Typebar";

const Start = (props) => {
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
      <div>
        <TypeBar />
      </div>
    </div>
  );
};

export default Start;
