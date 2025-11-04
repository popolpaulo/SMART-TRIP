const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Recherche de vols (accessible sans authentification)
router.post('/search', optionalAuth, flightController.searchFlights);

// Détails d'un vol
router.get('/:id', flightController.getFlightDetails);

// Réserver un vol (nécessite authentification)
router.post('/book', authenticateToken, flightController.bookFlight);

// Historique des recherches (nécessite authentification)
router.get('/user/searches', authenticateToken, flightController.getUserSearches);

module.exports = router;
