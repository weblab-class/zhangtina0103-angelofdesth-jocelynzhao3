import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);

socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});

/** Tells server that player has taken a card**/
export const takeCard = (card) => {
  socket.emit("cards", card);
};
