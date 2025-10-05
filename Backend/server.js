


// Filename: backend/server.js
// This is the final, complete version that correctly handles socket authentication.

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // <-- IMPORTANT: Make sure this is required
const logger = require('./utils/logger');
const app = require('./app'); 
const captainModel = require('./models/captain.model'); // <-- IMPORTANT: Make sure this is required
const userModel = require('./models/user.model');
const rideModel = require('./models/ride.model');

// --- SERVER SETUP ---
const port = process.env.PORT || 4000;
const server = http.createServer(app);

// --- SOCKET.IO INITIALIZATION ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

// --- SOCKET.IO CONNECTION HANDLING ---

io.on('connection', (socket) => {
  logger.info(`--- New WebSocket Client Connected: ${socket.id} ---`);

  // We are removing the automatic update from here to make it more explicit.

  socket.on('update-socket-id', async (data) => {
    const { userId } = data;
    if (!userId) return;
    try {
      await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
      console.log(`[SUCCESS] Manually associated socket ${socket.id} with captain ${userId}`);
      const roomName = `captain_${userId}`;
      socket.join(roomName);
      console.log(`[SOCKET] Socket ${socket.id} successfully joined room: ${roomName}`);
    } catch (err) {
      console.error("Failed to join room or update socket ID:", err);
    }
  });
  socket.on('update-user-socket-id', async (data) => {
    const { userId } = data;
    if (!userId) return;
    try {
        // NOTE: We need to require the userModel at the top of server.js
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`[SOCKET] User Socket ${socket.id} successfully joined room: ${roomName}`);
    } catch (err) {
        console.error("Failed to update user socket ID or join room:", err);
    }
  });

  // --- Standard Event Listeners ---
  socket.on('update-location', async (data) => {
    const { userId, location } = data;
    if (!userId || !location) return;
    try {
      await captainModel.findByIdAndUpdate(userId, {
        location: { type: 'Point', coordinates: [location.lng, location.lat] }
      });
    } catch (err) {
      logger.error(`Failed to update location for captain ${userId}: ${err.message}`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`--- WebSocket Client Disconnected: ${socket.id} ---`);
    // Optional: Here you could find the captain by socket.id and set their socketId to null
  });
});

// --- SERVER LIFECYCLE ---
server.listen(port, () => {
  logger.info(`🚀 Server is live and listening on port ${port}`);
});



server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${port} requires elevated privileges. Exiting.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${port} is already in use. Exiting.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// --- GRACEFUL SHUTDOWN ---
const shutdown = (signal) => () => {
  logger.info(`${signal} received: closing server gracefully.`);
  server.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));