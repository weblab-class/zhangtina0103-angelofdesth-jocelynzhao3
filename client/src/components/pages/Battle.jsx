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
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Function to fetch a new word and add it to display
  const fetchNewWord = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
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

      setIsLoading(true); // Show loading while fetching new word
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
      setIsLoading(false);

      // Clear input
      setTypedText("");
    }
  };

  // Initial fetch of words
  useEffect(() => {
    const initializeWords = async () => {
      setIsLoading(true);
      // Clear any existing words
      setDisplayedWords([]);
      
      // Use local array to track words
      const words = [];
      
      // Keep fetching until we have 3 unique words
      while (words.length < 3) {
        const newWords = await get("/api/word", { language: language });
        if (newWords && newWords.length > 0) {
          const newWord = newWords[0];
          // Check if this word is unique
          const isUnique = !words.some(
            (existingWord) =>
              existingWord.english.trim().toLowerCase() === newWord.english.trim().toLowerCase()
          );
          
          if (isUnique) {
            words.push(newWord);
          }
        }
      }
      
      // Set all words at once
      setDisplayedWords(words);
      setIsLoading(false);
    };

    initializeWords();
  }, [language]);

  // Keep display filled
  useEffect(() => {
    // Only fetch if we have less than 3 words and not during initialization
    if (displayedWords.length < 3) {
      fetchNewWord();
    }
  }, [displayedWords.length]);

  return (
    <div className="Battle-container">
      {isLoading ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading words...</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Battle;
