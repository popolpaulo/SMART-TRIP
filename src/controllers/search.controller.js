const db = require('../database/connection');
const logger = require('../utils/logger');

// Recherche globale (combinée)
exports.globalSearch = async (req, res) => {
  try {
    const { query, type = 'all' } = req.body;

    // TODO: Implémenter la recherche intelligente multi-critères
    
    logger.info(`Recherche globale: ${query} (type: ${type})`);

    res.json({
      message: 'Recherche globale en développement',
      query,
      type,
      results: {
        flights: [],
        hotels: [],
        activities: []
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche globale:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Destinations tendances
exports.getTrendingDestinations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT * FROM trending_destinations 
       ORDER BY trend_score DESC, search_count DESC 
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur lors de la récupération des tendances:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Suggestions basées sur l'IA
exports.getAISuggestions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { budget, duration, interests, departureCity } = req.body;

    // TODO: Implémenter l'IA pour les suggestions personnalisées
    // Utiliser les préférences utilisateur, l'historique, etc.

    logger.info(`Suggestions IA demandées (user: ${userId || 'guest'})`);

    res.json({
      message: 'Suggestions IA en développement',
      params: { budget, duration, interests, departureCity },
      suggestions: []
    });
  } catch (error) {
    logger.error('Erreur lors des suggestions IA:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Autocomplete pour les villes/aéroports
exports.autocomplete = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    // TODO: Connecter à une vraie base de données d'aéroports/villes
    // Pour l'instant, recherche basique dans les destinations tendances

    const result = await db.query(
      `SELECT DISTINCT city, country_code, country_name
       FROM trending_destinations
       WHERE LOWER(city) LIKE LOWER($1)
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur lors de l\'autocomplete:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
