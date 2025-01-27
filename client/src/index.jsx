import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Skeleton from "./components/pages/Skeleton";
import NotFound from "./components/pages/NotFound";
import Battle from "./components/pages/Battle";
import Start from "./components/pages/Start";
import BattleProfile from "./components/pages/BattleProfile";
import Instructions from "./components/pages/Instructions";
import Leaderboard from "./components/pages/Leaderboard";
import Lobbies from "./components/pages/Lobbies";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "776160739752-i1pq0rjlhc29rojlspqv1l19roag848n.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Start />} />
      <Route path="/lobbies/" element={<Lobbies />} />
      {/* empty url take you to the hardcodedlobby (aka the bot page) */}
      <Route path="/battle/" element={<Battle />} />
      {/* todo: add userid later in the url so the battling is unique */}
      <Route path="/battle/:lobby" element={<Battle />} />
      {/*  todo: add userid later in the url so the battle end screen is unique */}
      <Route path="/battleProfile/" element={<BattleProfile />} />
      <Route path="/instructions/" element={<Instructions />} />
      <Route path="/leaderboard/" element={<Leaderboard />} />
    </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
