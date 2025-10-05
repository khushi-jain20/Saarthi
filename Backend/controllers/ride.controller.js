

// Filename: backend/controllers/ride.controller.js (Final Refactored Version)
const { validationResult } = require('express-validator');
const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service');
const logger = require('../utils/logger');
const rideModel = require('../models/ride.model');


// Helper function for handling validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

module.exports = {
  

  /**
   * @route   GET /api/v1/rides/get-fare
   * @desc    Calculate ride fare based on pickup and destination
   * @access  Private (User)
   */
  async getFare(req, res) {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { pickup, destination } = req.query;
    if (!pickup || !destination) {
        return res.status(400).json({ success: false, message: 'Pickup and destination are required.' });
    }

    try {
      const fare = await rideService.getFare(pickup, destination);
      return res.status(200).json(fare);

    } catch (error) {
      // This catches errors from the service layer (e.g., LocationIQ fails)
      logger.error(`Fare calculation failed. Reason: ${error.message}`);
      return res.status(400).json({
        success: false,
        message: error.message || 'Could not calculate fare for the provided locations.'
      });
    }
  },

  /**
   * @route   POST /api/v1/rides/create
   * @desc    Create a new ride request, find captains, and notify them
   * @access  Private (User)
   */

  


  // In backend/controllers/ride.controller.js

 createRide: async (req, res) => {
    // We now receive fareDetails from the frontend.
    const { pickup, destination, vehicleType, fareDetails } = req.body;
    const userId = req.user.id;

    try {
        // The controller no longer calculates the fare. It just gets coordinates.
        const pickupCoords = await mapService.getCoordinates(pickup);
        const availableCaptains = await mapService.getCaptainsInTheRadius(pickupCoords, 10000);

        if (availableCaptains.length === 0) {
            return res.status(404).json({ message: 'No captains available nearby.' });
        }
        
        // Prepare the clean data object for the service.
        const rideData = {
            user: userId,
            pickupLocation: { address: pickup, coordinates: [pickupCoords.lng, pickupCoords.lat] },
            destinationLocation: { address: destination, coordinates: [pickupCoords.lng, pickupCoords.lat] },
            vehicleType: vehicleType,
            finalFare: fareDetails[vehicleType], // Saves the specific fare, e.g., 94
            fareDetails: fareDetails,
            distance: fareDetails.distance,
            duration: fareDetails.duration
        };
        
        const ride = await rideService.createRide(rideData);
        const rideWithUser = await rideModel.findById(ride._id).populate('user', 'fullname email');

        // Notify captains
        availableCaptains.forEach(captain => {

            console.log(`[SOCKET DEBUG] Trying to notify captain ${captain.email}`);
            console.log(`[SOCKET DEBUG]   - DB socketId: ${captain.socketId}`);
            if (captain.socketId) {
                const captainRoom = `captain_${captain._id}`;
                req.app.get('io').to(captainRoom).emit('new-ride', rideWithUser);
                logger.info(`Notifying Captain in room ${captainRoom}`);
            }
        });
        
        return res.status(201).json(ride);

    } catch (error) {
        logger.error('Ride Creation Controller Error:', error.message);
        return res.status(400).json({ message: error.message || 'Failed to create ride.' });
    }
  },

  
  async confirmRide(req, res) {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    try {
      const ride = await rideService.confirmRide({ rideId: req.body.rideId, captain: req.captain });
      // Notify the user that a captain has accepted
      const userRoom = `user_${ride.user._id}`;
      req.app.get('io').to(userRoom).emit('ride-confirmed', ride);
      logger.info(`Ride ${ride._id} confirmed by captain ${req.captain._id}`);
      return res.status(200).json(ride);
    } catch (error) {
      logger.error('Ride confirmation failed:', error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * @route   GET /api/v1/rides/start-ride
   * @desc    Captain starts the ride after verifying OTP
   * @access  Private (Captain)
   */
  async startRide(req, res) {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    try {
      const ride = await rideService.startRide({ rideId: req.query.rideId, otp: req.query.otp, captain: req.captain });
      // Notify the user that the ride has started
      const userRoom = `user_${ride.user._id}`;
      req.app.get('io').to(userRoom).emit('ride-started', ride);``
      logger.info(`Ride ${ride._id} started by captain ${req.captain._id}`);
      return res.status(200).json(ride);
    } catch (error) {
      logger.error('Ride start failed:', error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * @route   POST /api/v1/rides/end-ride
   * @desc    Captain ends the ride
   * @access  Private (Captain)
   */
  async endRide(req, res) {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;
    
    try {
      const ride = await rideService.endRide({ rideId: req.body.rideId, captain: req.captain });
      const finalFare = ride.fare; // The fare is already calculated and stored in the ride document.

      // Notify the user that the ride has ended and send final details
      req.app.get('io').to(ride.user.socketId).emit('ride-ended', { ...ride.toObject(), fare: finalFare });
      logger.info(`Ride ${ride._id} ended by captain ${req.captain._id}`);
      return res.status(200).json(ride);
    } catch (error) {
      logger.error('Ride end failed:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};