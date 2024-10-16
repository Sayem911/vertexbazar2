// File: server.js
require('dotenv').config({ path: './.env.local' });  // Load environment variables from .env.local file
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dbConnect = require('./src/lib/db'); // Import the database connection function

// Create an Express app
const app = express();

// Create an HTTP server and pass the Express app to it
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PATCH"],
  },
});

// Export the io instance for use in other parts of the project
module.exports = { io };

// Connect to MongoDB
(async () => {
  await dbConnect();
})();

// When a new client connects to the socket
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle new order event from clients
  socket.on('newOrder', (order) => {
    // Broadcast the new order event to all connected clients
    io.emit('newOrder', order);
  });

  // Handle order status updates
  socket.on('orderStatusUpdate', (updatedOrder) => {
    // Broadcast the updated order status to all connected clients
    io.emit('orderStatusUpdate', updatedOrder);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Set the port for the server to listen on
const PORT = process.env.PORT || 3001;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
