const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Middleware pour vérifier le JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    logger.warn(`Token invalide: ${err.message}`);
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware optionnel (continue même sans token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
    } catch (err) {
      // Token invalide mais on continue quand même
      logger.debug(`Token optionnel invalide: ${err.message}`);
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
