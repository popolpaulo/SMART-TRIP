const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Recherche d'hôtels
router.post('/search', optionalAuth, hotelController.searchHotels);

// Détails d'un hôtel
router.get('/:id', hotelController.getHotelDetails);

// Réserver un hôtel
router.post('/book', authenticateToken, hotelController.bookHotel);

module.exports = router;
