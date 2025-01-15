import "../../utilities.css";
import "./Start.css";


import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";


const Start = (props) => {

    return (
        <GoogleLogin
        text="signin_with"
        onSuccess={props.handleLogin}
        onFailure={(err) => console.log(err)}
        containerProps= {{'className': "NavBar-link NavBar-login u-inlineBlock"}}
        />
    );
};

export default Start;