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
  // console.log("trying to render", props.lobbies);
  return (
    <div className="lobby-list-container">
      {props.lobbies.length > 0 ? (
        <div className="lobby-table">
          <div className="lobby-table-header">
            <div className="lobby-row">
              <div className="lobby-cell">Lobby ID</div>
              <div className="lobby-cell">Players</div>
              {/* <div className="lobby-cell">P2</div> */}
              <div className="lobby-cell">Language</div>
            </div>
          </div>
          <div className="lobby-table-body">
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
        </div>
      ) : (
        <p className="no-lobbies-message">There are no active lobbies. You can change that!</p>
      )}
    </div>
  );
};

export default LobbyList;
