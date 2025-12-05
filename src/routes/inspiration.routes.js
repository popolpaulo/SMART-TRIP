const express = require('express');
const router = express.Router();
const { filterDestinationsByWeather } = require('../services/weather.service');
const { DESTINATIONS } = require('../utils/destinations');

/**
 * POST /api/inspiration
 * Retourne des suggestions de destinations basées sur les critères météo
 */
router.post('/', async (req, res) => {
  try {
    const { weather, temperature, budget, activities } = req.body;

    // Filtrer selon la météo et température
    const weatherCriteria = { weather, temperature };
    const suggestedDestinations = await filterDestinationsByWeather(
      DESTINATIONS,
      weatherCriteria
    );

    // Optionnel : filtrage supplémentaire selon budget/activités
    // (pour l'instant, on retourne juste les destinations filtrées par météo)

    res.json({
      success: true,
      destinations: suggestedDestinations.slice(0, 10), // Top 10
      count: suggestedDestinations.length
    });
  } catch (error) {
    console.error('Erreur route inspiration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de destinations',
      error: error.message
    });
  }
});

module.exports = router;
