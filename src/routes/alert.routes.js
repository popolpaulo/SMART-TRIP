const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent authentification
router.use(authenticateToken);

// CRUD pour les alertes de prix
router.get('/', alertController.getUserAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

// Activer/désactiver une alerte
router.patch('/:id/toggle', alertController.toggleAlert);

module.exports = router;
