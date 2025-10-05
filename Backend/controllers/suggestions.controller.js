// controllers/suggestions.controller.js
const mapsService = require('../services/maps.service');

exports.getSuggestions = async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input || input.length < 2) {
      return res.status(400).json({
        error: 'Input must be at least 2 characters long'
      });
    }

    const suggestions = await mapsService.getPlaceSuggestions(input);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestion Controller Error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};