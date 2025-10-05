// Filename: backend/socket.js

const { Server } = require('socket.io');
const logger = require('./utils/logger');
const Captain = require('./models/captain.model'); // Adjust path if needed

let io; // We'll export this to use elsewhere if needed

function initializeSocket(server) {
  // Create the Socket.IO server instance
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL, // Your frontend URL from .env
      methods: ["GET", "POST"]
    }
  });

  // --- Main connection listener ---
  io.on('connection', (socket) => {
    logger.info(`WebSocket Connected: ${socket.id}`);

    // --- Event listener for joining a room ---
    // A user or captain will join a room named after their own ID
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // --- Event listener for captain location updates ---
    socket.on('update-location', async (data) => {
      const { userId, location } = data;
      if (!userId || !location) return;
      
      try {
        // Update the captain's document with their socketId and new location
        await Captain.findByIdAndUpdate(userId, {
          socketId: socket.id,
          location: {
            type: 'Point',
            coordinates: [location.lng, location.lat] // [longitude, latitude]
          }
        });
      } catch (err) {
        logger.error(`Failed to update location for captain ${userId}:`, err);
      }
    });

    // --- Event listener for disconnection ---
    socket.on('disconnect', () => {
      logger.info(`WebSocket Disconnected: ${socket.id}`);
      // Optionally, you could update the captain's status to offline here
    });
  });

  // Return the io instance so it can be used in other parts of the app
  return io;
}

// Function to get the io instance if it's already initialized
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Function to send a message to a specific room
const sendMessageToRoom = (room, event, data) => {
    getIO().to(room).emit(event, data);
};

module.exports = { initializeSocket, getIO, sendMessageToRoom };