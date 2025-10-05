// Filename: backend/services/ride.service.js (Final Simplified Version)
const rideModel = require('../models/ride.model');
const crypto = require('crypto');
const logger = require('../utils/logger');
const mapService = require('./maps.service'); // Still needed for getDistanceTime in getFare

async function getFare(pickup, destination) {
  try {
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    const baseFare = { go: 50, moto: 20, auto: 30 };
    const perKmRate = { go: 15, moto: 8, auto: 10 };
    const distanceKm = distanceTime.distance.value / 1000;
    return {
      go: Math.round(baseFare.go + (distanceKm * perKmRate.go)),
      moto: Math.round(baseFare.moto + (distanceKm * perKmRate.moto)),
      auto: Math.round(baseFare.auto + (distanceKm * perKmRate.auto)),
      distance: distanceTime.distance.text,
      duration: distanceTime.duration.text
    };
  } catch (error) {
    logger.error('Fare Calculation Service Error:', error.message);
    throw new Error('Failed to calculate fare');
  }
}

function generateOtp(length = 6) {
  return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

module.exports = {
  getFare,

  // This function is now much simpler. Its only job is to create the document.
  createRide: async (rideData) => {
    try {
      const ride = new rideModel({
        ...rideData,
        otp: generateOtp(),
        status: 'requested'
      });
      await ride.save();
      return ride;
    } catch (error) {
      logger.error('Ride Creation DB Error:', error.message);
      throw error;
    }
  },

  

  confirmRide: async ({ rideId, captain }) => {
    try {
      if (!rideId || !captain) {
        throw new Error('Ride id and captain are required');
      }

      // FIXED: Look for 'requested' status, not 'pending', to match our new flow.
      const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, status: 'requested' },
        { 
          status: 'accepted',
          captain: captain._id
        },
        { new: true }
      ).populate('user', 'fullname email phone socketId').populate('captain').select('+otp');

      if (!ride) {
        throw new Error('Ride not found or has already been accepted by another captain.');
      }

      return ride;

    } catch (error) {
      console.error('Ride Confirmation Error:', error.message);
      throw new Error('Failed to confirm ride');
    }
  },

  // The rest of the functions are correct for the real flow.
  startRide: async ({ rideId, otp, captain }) => {
    try {
      if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
      }

      const ride = await rideModel.findOne({ _id: rideId, captain: captain._id, status: 'accepted' }).select('+otp');
      if (!ride) {
        throw new Error('Ride not found for this captain or is not in accepted state.');
      }

      console.log('--- OTP VALIDATION DEBUG ---');
      console.log(`Database OTP:   '${ride.otp}' (Type: ${typeof ride.otp})`);
      console.log(`Entered OTP:    '${otp}' (Type: ${typeof otp})`);

      if (String(ride.otp) !== String(otp)) {
        console.log('--- COMPARISON FAILED ---');
        throw new Error('Invalid OTP');
      }

      console.log('--- OTP MATCH SUCCESSFUL ---');

      const updatedRide = await rideModel.findByIdAndUpdate(
        rideId,
        { status: 'ongoing' },
        { new: true }
      ).populate('user', 'fullname email phone socketId').populate('captain');

      return updatedRide;

    } catch (error) {
      console.error('Ride Start Error:', error);
      throw new Error(error.message || 'Failed to start ride');
    }
  },

  endRide: async ({ rideId, captain }) => {
    try {
      if (!rideId) {
        throw new Error('Ride id is required');
      }

      const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, captain: captain._id, status: 'ongoing' },
        { status: 'completed' },
        { new: true }
      ).populate('user', 'fullname email phone socketId').populate('captain');

      if (!ride) {
        throw new Error('Ride not found or not currently ongoing for this captain.');
      }

      return ride;

    } catch (error) {
      console.error('Ride End Error:', error.message);
      throw new Error('Failed to end ride');
    }
  }
};