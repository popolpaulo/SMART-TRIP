const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Routes protégées (nécessitent authentification)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/preferences', authenticateToken, userController.getPreferences);
router.put('/preferences', authenticateToken, userController.updatePreferences);
router.delete('/account', authenticateToken, userController.deleteAccount);

module.exports = router;
