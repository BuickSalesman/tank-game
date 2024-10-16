// socketindex.js

const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for chat messages
  socket.on("join", () => {
    console.log("player joined");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
