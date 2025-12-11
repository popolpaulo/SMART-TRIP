const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Recherche globale (vols + hôtels + activités)
router.post('/global', optionalAuth, searchController.globalSearch);

// Destinations tendances
router.get('/trending', searchController.getTrendingDestinations);

// Destinations populaires (basées sur les recherches réelles)
router.get('/popular-destinations', searchController.getPopularDestinations);

// Suggestions basées sur l'IA
router.post('/suggestions', optionalAuth, searchController.getAISuggestions);

// Autocomplete pour les villes/aéroports
router.get('/autocomplete', searchController.autocomplete);

module.exports = router;
