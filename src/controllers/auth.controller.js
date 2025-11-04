const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const logger = require('../utils/logger');

// Inscription
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, created_at`,
      [email, passwordHash, firstName, lastName, phone || null, dateOfBirth || null]
    );

    const user = result.rows[0];

    // Créer un profil par défaut
    await db.query(
      `INSERT INTO user_profiles (user_id)
       VALUES ($1)`,
      [user.id]
    );

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`Nouvel utilisateur inscrit: ${email}`);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const result = await db.query(
      'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`Connexion réussie: ${email}`);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// Vérifier le token
exports.verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const result = await db.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json({
      valid: true,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

// Déconnexion (côté client principalement)
exports.logout = (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
};
