const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent authentification
router.use(authenticateToken);

// CRUD pour les voyages
router.get('/', tripController.getUserTrips);
router.get('/:id', tripController.getTripById);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

// Ajouter/retirer des activités
router.post('/:id/activities', tripController.addActivity);
router.delete('/:id/activities/:activityId', tripController.removeActivity);

module.exports = router;
