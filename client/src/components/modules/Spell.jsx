// Word to translate and associated action/spell

import "./Spell.css";

/**
 * Proptypes
 *  ADD PROPS HERE
 */

const Spell = (props) => {
  return (
    <div className="Spell-container">
      <div className="Spell-filter"></div>
      <div className="Spell-word">{props.word}</div>
    </div>
  );
};

export default Spell;
