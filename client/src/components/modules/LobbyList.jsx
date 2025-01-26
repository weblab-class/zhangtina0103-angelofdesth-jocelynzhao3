import "../../utilities.css";
import "./LobbyList.css";

import SingleActiveLobby from "./SingleActiveLobby";

/**
 * The screen for creating lobbies
 *
 * Proptypes
 * @param {[lobby]} lobbies - array of all active lobbies
 * @param {} displayedLobby 
 * @param {} setDisplayedLobby - 
 */

const LobbyList = (props) => {
    // TODO: once you are in a lobby that you created yourself,
    // then you're not allowed to click on any other lobby.
    console.log("trying to render", props.lobbies);
    return (
        <div>
            {props.lobbies.length > 0 ? (
            <div>
            <p> Here are the active lobbies: </p>
            {props.lobbies.map((lobby) => (
                <>
                <SingleActiveLobby 
                    lobby={lobby}
                    setDisplayedLobby={props.setDisplayedLobby}
                    active={ props.displayedLobby ? 
                        props.displayedLobby.lobbyid === lobby.lobbyid : false}
                    setInLobby={props.setInLobby}
                />
                </>
                
            ))}
            </div>
            ) : (
            <p> There are no active lobbies. You can change that! </p>
            )
            }
        </div>
        
    )
};

export default LobbyList