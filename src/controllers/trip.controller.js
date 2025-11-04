const db = require('../database/connection');
const logger = require('../utils/logger');

// Obtenir tous les voyages d'un utilisateur
exports.getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM trips 
       WHERE user_id = $1 
       ORDER BY start_date DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur lors de la récupération des voyages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir un voyage par ID
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage introuvable' });
    }

    // Récupérer les activités associées
    const activities = await db.query(
      `SELECT ta.*, a.name, a.description, a.category, a.latitude, a.longitude
       FROM trip_activities ta
       JOIN activities a ON ta.activity_id = a.id
       WHERE ta.trip_id = $1
       ORDER BY ta.scheduled_date, ta.scheduled_time`,
      [id]
    );

    const trip = result.rows[0];
    trip.activities = activities.rows;

    res.json(trip);
  } catch (error) {
    logger.error('Erreur lors de la récupération du voyage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer un nouveau voyage
exports.createTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      destinationCity,
      destinationCountry,
      startDate,
      endDate,
      budgetTotal,
      currency = 'EUR',
      tripStyle
    } = req.body;

    const result = await db.query(
      `INSERT INTO trips 
       (user_id, title, description, destination_city, destination_country,
        start_date, end_date, budget_total, currency, trip_style)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, title, description || null, destinationCity, destinationCountry,
       startDate, endDate, budgetTotal || null, currency, tripStyle || null]
    );

    logger.info(`Nouveau voyage créé: ${title}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la création du voyage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour un voyage
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title, description, startDate, endDate,
      budgetTotal, budgetSpent, status, tripStyle, isPublic
    } = req.body;

    const result = await db.query(
      `UPDATE trips 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           budget_total = COALESCE($5, budget_total),
           budget_spent = COALESCE($6, budget_spent),
           status = COALESCE($7, status),
           trip_style = COALESCE($8, trip_style),
           is_public = COALESCE($9, is_public)
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [title, description, startDate, endDate, budgetTotal, budgetSpent,
       status, tripStyle, isPublic, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage introuvable' });
    }

    logger.info(`Voyage mis à jour: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du voyage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un voyage
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage introuvable' });
    }

    logger.info(`Voyage supprimé: ${id}`);
    res.json({ message: 'Voyage supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du voyage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajouter une activité à un voyage
exports.addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { activityId, scheduledDate, scheduledTime, notes } = req.body;

    // Vérifier que le voyage appartient à l'utilisateur
    const trip = await db.query(
      'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (trip.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage introuvable' });
    }

    const result = await db.query(
      `INSERT INTO trip_activities (trip_id, activity_id, scheduled_date, scheduled_time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, activityId, scheduledDate || null, scheduledTime || null, notes || null]
    );

    logger.info(`Activité ajoutée au voyage ${id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'activité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Retirer une activité d'un voyage
exports.removeActivity = async (req, res) => {
  try {
    const { id, activityId } = req.params;
    const userId = req.user.id;

    // Vérifier que le voyage appartient à l'utilisateur
    const trip = await db.query(
      'SELECT id FROM trips WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (trip.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage introuvable' });
    }

    await db.query(
      'DELETE FROM trip_activities WHERE trip_id = $1 AND activity_id = $2',
      [id, activityId]
    );

    logger.info(`Activité retirée du voyage ${id}`);
    res.json({ message: 'Activité retirée avec succès' });
  } catch (error) {
    logger.error('Erreur lors du retrait de l\'activité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
