// Filename: backend/routes/ride.routes.js

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Assuming you have this middleware

// --- *** THIS IS THE CRITICAL FIX FOR THE 404 ERROR *** ---
// This route was likely missing or misconfigured.

/**
 * @route   POST /api/v1/rides/create
 * @desc    User creates a new ride request
 * @access  Private (User)
 */
router.post(
    '/create',
    authMiddleware.authUser, // Protect the route, only logged-in users can create rides
    [
        // Add validation for the request body
        body('pickup', 'Pickup location is required').isString().notEmpty(),
        body('destination', 'Destination is required').isString().notEmpty(),
        body('vehicleType', 'Vehicle type is required').isIn(['go', 'auto', 'moto'])
    ],
    rideController.createRide // This points to the function in your controller
);


// --- YOUR OTHER RIDE ROUTES (PRESERVED) ---

/**
 * @route   GET /api/v1/rides/get-fare
 * @desc    Calculate ride fare
 * @access  Private (User)
 */
router.get(
    '/get-fare',
    authMiddleware.authUser,
    [
        query('pickup').isString().notEmpty(),
        query('destination').isString().notEmpty()
    ],
    rideController.getFare
);

/**
 * @route   POST /api/v1/rides/confirm
 * @desc    Captain confirms a ride
 * @access  Private (Captain)
 */
router.post(
    '/confirm',
    authMiddleware.authCaptain,
    [ body('rideId', 'Ride ID is required').isMongoId() ],
    rideController.confirmRide
);

/**
 * @route   GET /api/v1/rides/start-ride
 * @desc    Captain starts a ride with OTP
 * @access  Private (Captain)
 */
router.get(
    '/start-ride',
    authMiddleware.authCaptain,
    [
        query('rideId').isMongoId(),
        query('otp').isLength({ min: 6, max: 6 })
    ],
    rideController.startRide
);

/**
 * @route   POST /api/v1/rides/end-ride
 * @desc    Captain ends a ride
 * @access  Private (Captain)
 */
router.post(
    '/end-ride',
    authMiddleware.authCaptain,
    [ body('rideId').isMongoId() ],
    rideController.endRide
);

module.exports = router;