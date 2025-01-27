import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);

socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

/** Tells server which player took wha card**/
/** use this to modify game state later */
export const takeCard = (cardIndex, userId, lobby) => {
  console.log("Taking card at index:", cardIndex, "by user:", userId, "in lobby:", lobby);
  socket.emit("cards", { cardIndex, userId, lobby });
};
