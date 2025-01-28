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
  console.log("trying to render", props.lobbies);
  return (
    <div>
      {props.lobbies.length > 0 ? (
        <div>
          <p> Here are the active lobbies: </p>
          {props.lobbies
            .filter((lobby) => lobby.active)
            .map((lobby) => (
              <SingleActiveLobby
                key={lobby.lobbyid}
                lobby={lobby}
                setDisplayedLobby={props.setDisplayedLobby}
                active={props.displayedLobby ? props.displayedLobby === lobby.lobbyid : false}
                setInLobby={props.setInLobby}
                formatPlayerDisplay={props.formatPlayerDisplay}
              />
            ))}
        </div>
      ) : (
        <p> There are no active lobbies. You can change that! </p>
      )}
    </div>
  );
};

export default LobbyList;
