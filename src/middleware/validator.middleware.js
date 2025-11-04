const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Erreurs de validation:', errors.array());
    return res.status(400).json({ 
      error: 'Validation échouée',
      details: errors.array() 
    });
  }
  
  next();
};

module.exports = validate;
