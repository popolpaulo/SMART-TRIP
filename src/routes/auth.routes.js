const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validator.middleware');

// Route d'inscription
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  validate,
  authController.register
);

// Route de connexion
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  authController.login
);

// Route de vérification du token
router.get('/verify', authController.verifyToken);

// Route de déconnexion
router.post('/logout', authController.logout);

module.exports = router;
