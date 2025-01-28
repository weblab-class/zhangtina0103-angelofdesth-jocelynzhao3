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
    <div className="lobby-list-container">
      {props.lobbies.length > 0 ? (
        <div className="lobby-table">
          <div className="lobby-table-header">
            <div className="lobby-row">
              <div className="lobby-cell">Player 1</div>
              <div className="lobby-cell">Player 2</div>
              <div className="lobby-cell">Language</div>
            </div>
          </div>
          <div className="lobby-table-body">
            {props.lobbies
              .filter((lobby) => lobby.active)
              .map((lobby, i) => (
                <SingleActiveLobby
                  key={i}
                  lobby={lobby}
                  setDisplayedLobby={props.setDisplayedLobby}
                  displayedLobby={props.displayedLobby}
                  setInLobby={props.setInLobby}
                  formatPlayerDisplay={props.formatPlayerDisplay}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="no-lobbies-message">No active lobbies</div>
      )}
    </div>
  );
};

export default LobbyList;
