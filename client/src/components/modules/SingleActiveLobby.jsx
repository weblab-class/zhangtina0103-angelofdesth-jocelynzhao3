import "../../utilities.css";

const SingleActiveLobby = (props) => {

    return (
    <div>
        <p> I am active: {props.active} </p>
        <p> Lobby ID: {props.lobby.lobbyid}, P1: {props.lobby.p1}, Language: {props.lobby.language}
        </p>
    </div>
    )
    
};


export default SingleActiveLobby