import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";

import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

// to use styles, import the necessary CSS files
import "../utilities.css";
import "./App.css";

export const UserContext = createContext(null);
export const LanguageContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [language, setLanguage] = useState(""); // Initialize as empty string

  useEffect(() => {
    get("/api/whoami").then((user) => {
      console.log("Whoami response:", user);
      if (user._id) {
        setUserId(user._id);
        setUserName(user.name);
        console.log("Set user data:", { id: user._id, name: user.name });
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      console.log("Login response:", user);
      setUserId(user._id);
      setUserName(user.name);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    userName,
    handleLogin,
    handleLogout,
  };

  console.log("Current auth context:", authContextValue);

  return (
    <div className="App-container">
      <UserContext.Provider value={authContextValue}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <Outlet />
        </LanguageContext.Provider>
      </UserContext.Provider>
    </div>
  );
};

export default App;
