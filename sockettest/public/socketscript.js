const socket = io();

function joinGame() {
  console.log("JEFF");
  socket.emit("join");
}
