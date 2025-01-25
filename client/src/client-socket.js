import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);

socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

/** Tells server which player took wha card**/
/** use this to modify game state later */
export const takeCard = (card, userId, lobby) => {
  console.log("I am taking the card", card);
  socket.emit("cards", { card, userId, lobby });
};
