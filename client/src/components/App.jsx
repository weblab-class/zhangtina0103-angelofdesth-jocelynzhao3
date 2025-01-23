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
export const UserInfoContext = createContext(null);
export const LanguageContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userInfo, setUserInfo] = useState(null);
  const [language, setLanguage] = useState(""); // Initialize as empty string

  useEffect(() => {
    get("/api/whoami").then((user) => {
      console.log("Whoami response:", user);
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserInfo(user); // Set user info directly from whoami response
        console.log("User is logged in with ID:", user._id);
      } else {
        setUserId(undefined);
        setUserInfo(null);
        console.log("No user logged in");
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Attempting login as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      console.log("Login response:", user);
      setUserId(user._id);
      setUserInfo(user); // Set user info directly from login response
      post("/api/initsocket", { socketid: socket.id });
    }).catch((err) => {
      console.error("Login error:", err);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserInfo(null);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
  };

  return (
    <div className="App-container">
      <UserContext.Provider value={authContextValue}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <UserInfoContext.Provider value={{ userInfo, setUserInfo }}>
            <Outlet />
          </UserInfoContext.Provider>
        </LanguageContext.Provider>
      </UserContext.Provider>
    </div>
  );
};

export default App;
