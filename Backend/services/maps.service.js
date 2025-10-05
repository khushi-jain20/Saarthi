// Filename: backend/services/maps.service.js
// This is the complete, final version using LocationIQ with proper error handling and encoding.

const axios = require('axios');
const captainModel = require('../models/captain.model');
const logger = require('../utils/logger');

// Retrieve the API key from environment variables
const API_KEY = process.env.LOCATIONIQ_API_KEY;
const BASE_URL = 'https://us1.locationiq.com/v1';

module.exports = {

  /**
   * Converts a string address into geographic coordinates.
   * @param {string} address The address to geocode.
   * @returns {Promise<{lat: number, lng: number}>} The coordinates.
   */
  getCoordinates: async (address) => {
    if (!API_KEY) throw new Error('LocationIQ API key is not configured.');
    logger.info(`[LocationIQ] Geocoding address: "${address}"`);

    try {
      // Properly encode the address to handle all special characters like commas and spaces.
      const encodedAddress = encodeURIComponent(address);
      const response = await axios.get(`${BASE_URL}/search.php?key=${API_KEY}&q=${encodedAddress}&format=json&limit=1`);

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        // Note: LocationIQ uses 'lon' for longitude. We return 'lng' for consistency.
        return { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
      }
      throw new Error('No coordinates found for the address.');
    } catch (error) {
      // Log the detailed error from the API if it exists
        if (error.response) {
            logger.error('LocationIQ Geocoding API Response Error:', { 
                status: error.response.status, 
                data: error.response.data 
            });
        } else {
            logger.error('LocationIQ Geocoding Network Error:', error.message);
        }
        throw new Error('Could not find location for the provided address.');
      
    }
  },

  /**
   * Calculates the distance and duration between two addresses.
   * @param {string} originAddress The starting address.
   * @param {string} destinationAddress The ending address.
   * @returns {Promise<object>} An object with distance and duration.
   */
  getDistanceTime: async (originAddress, destinationAddress) => {
    if (!API_KEY) throw new Error('LocationIQ API key is not configured.');

    try {
      const originCoords = await module.exports.getCoordinates(originAddress);
      const destinationCoords = await module.exports.getCoordinates(destinationAddress);
      
      const coordsString = `${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}`;
      logger.info(`[LocationIQ] Getting directions for coordinates: ${coordsString}`);

      const response = await axios.get(`${BASE_URL}/directions/driving/${coordsString}`, {
        params: { key: API_KEY, overview: 'full' }
      });

      if (response.data.code === 'Ok' && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        // The data structure is designed to match what ride.service.js expects.
        return {
          distance: { value: route.distance, text: `${(route.distance / 1000).toFixed(1)} km` },
          duration: { value: route.duration, text: `${Math.round(route.duration / 60)} mins` },
          status: 'OK'
        };
      }
      throw new Error('Could not find a route between the locations.');
    } catch (err) {
      if (err.response) {
            logger.error('LocationIQ Directions API Response Error:', {
                status: err.response.status,
                data: err.response.data
            });
      } else {
            logger.error('LocationIQ Directions Network Error:', err.message);
      }
        throw new Error('Route calculation service unavailable.');
    }
      
  },

  /**
   * Gets address autocomplete suggestions based on user input.
   * @param {string} input The partial address input from the user.
   * @returns {Promise<Array<{description: string}>>} A list of suggestions.
   */
  getAutoCompleteSuggestions: async (input) => {
    if (!API_KEY) return [];
    if (!input || input.length < 2) return [];

    try {
      const encodedInput = encodeURIComponent(input);
      const response = await axios.get(`${BASE_URL}/autocomplete.php?key=${API_KEY}&q=${encodedInput}`);
      
      if (response.data && response.data.length > 0) {
        return response.data.map(suggestion => ({ description: suggestion.display_name }));
      }
      return [];
    } catch (err) {
      logger.error('LocationIQ Autocomplete Error:', err.message);
      return [];
    }
  },

  /**
   * Finds available captains within a given radius from a central point.
   * @param {object} coords The central coordinates { lat, lng }.
   * @param {number} radius The search radius in meters.
   * @returns {Promise<Array<object>>} A list of captain documents.
   */
  getCaptainsInTheRadius: async (coords, radius) => { 
    try {
      if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
        throw new Error("Invalid coordinates provided to search for captains.");
      }
      const centerCoordinates = [coords.lng, coords.lat];
      
      return await captainModel.find({
        location: {
          $geoWithin: {
            $centerSphere: [centerCoordinates, radius / 6371000] // Radius in radians
          }
        },
        isAvailable: true
      });
    } catch (err) {
      logger.error('Captain Search Error:', err);
      throw new Error('Failed to find captains');
    }
  }
};