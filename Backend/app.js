require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import the centralized logger
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected successfully.'))
  .catch(err => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

// --- MIDDLEWARE SETUP ---

// Define detailed CORS options for security
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Your frontend's URL from .env
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Security and Logging Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight requests
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Use morgan for logging HTTP requests through our logger
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) },
  skip: (req) => req.url === '/health'
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);


// --- API ROUTES ---
app.use('/api/v1/auth', require('./routes/user.routes'));
app.use('/api/v1/maps', require('./routes/maps.routes'));
app.use('/api/v1/rides', require('./routes/ride.routes'));
app.use('/api/v1/captains', require('./routes/captain.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// --- ERROR HANDLING ---

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

module.exports = app;