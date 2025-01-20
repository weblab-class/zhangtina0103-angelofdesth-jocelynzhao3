import "../../utilities.css";
import "./Battle.css";
import { drawCanvas } from "../../canvasManager.js";
import Spell from "../modules/Spell";
import TypeBar from "../modules/Typebar";

import { Link } from "react-router-dom";
import { get } from "../../utilities";
import { takeCard } from "../../client-socket";
import React, { useState, useEffect, useContext } from "react";

import { LanguageContext } from "../App";
import { UserContext } from "../App";

const Battle = (props) => {
  const { language } = useContext(LanguageContext);
  const userContext = useContext(UserContext);
  const [displayedWords, setDisplayedWords] = useState([]); // Current words shown
  const [typedText, setTypedText] = useState(""); // Track user input

  // Function to fetch a new word and add it to display
  const fetchNewWord = async () => {
    const newWords = await get("/api/word", { language: language });
    if (newWords && newWords.length > 0) {
      const newWord = newWords[0];
      // Only add if it's not already displayed
      if (!displayedWords.some((word) => word.word === newWord.word)) {
        setDisplayedWords((prev) => {
          const newWords = [...prev, newWord];
          // Only keep the first 3 words
          return newWords.slice(0, 3);
        });
      }
    }
  };

  const handleTyping = async (text) => {
    setTypedText(text);
    
    // Normalize input text: trim spaces and convert to lowercase
    const normalizedInput = text.trim().toLowerCase();
    
    // Find the index of the matched word, with case-insensitive comparison
    const matchIndex = displayedWords.findIndex(
      (word) => word.english.trim().toLowerCase() === normalizedInput
    );

    if (matchIndex !== -1) {
      const matchedWord = displayedWords[matchIndex];
      console.log("Match found!", matchedWord);

      // Update game state
      takeCard(matchedWord, userContext.userId);

      // Get new word from API
      const newWords = await get("/api/word", { language: language });
      if (newWords && newWords.length > 0) {
        const newWord = newWords[0];
        // Replace word at the same index
        setDisplayedWords((prev) => {
          const newWords = [...prev];
          newWords[matchIndex] = newWord;
          return newWords;
        });
      }

      // Clear input
      setTypedText("");
    }
  };

  // Initial fetch of words
  useEffect(() => {
    const initializeWords = async () => {
      // Clear any existing words
      setDisplayedWords([]);
      // Fetch 3 initial words
      for (let i = 0; i < 2; i++) {
        await fetchNewWord();
      }
    };
    initializeWords();
  }, []);

  // Keep display filled
  useEffect(() => {
    // Only fetch if we have less than 3 words and not during initialization
    if (displayedWords.length < 3) {
      fetchNewWord();
    }
  }, [displayedWords.length]);

  return (
    <div className="Battle-container">
      <p>You have reached the battle page</p>
      <p>Your info and HP = 100</p>
      <p>Your opponent info and HP = 100</p>

      <div className="debug-info">
        <p>Current words: {displayedWords.map((word) => [word.word, word.english]).join(", ")}</p>
      </div>
      <div>
        <TypeBar cards={displayedWords} onType={handleTyping} typedText={typedText} />
      </div>

      <Link to="/end/" className="NavBar-link u-inlineBlock">
        Finish battle
      </Link>
    </div>
  );
};

export default Battle;
