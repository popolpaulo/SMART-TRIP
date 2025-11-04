const db = require('../database/connection');
const logger = require('../utils/logger');

// Obtenir toutes les alertes d'un utilisateur
exports.getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM price_alerts 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir une alerte par ID
exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM price_alerts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerte introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle alerte
exports.createAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      alertType,
      originCode,
      destinationCode,
      departureDateStart,
      departureDateEnd,
      targetPrice,
      currency = 'EUR',
      notificationEmail = true,
      notificationPush = false
    } = req.body;

    const result = await db.query(
      `INSERT INTO price_alerts 
       (user_id, alert_type, origin_code, destination_code, 
        departure_date_start, departure_date_end, target_price, currency,
        notification_email, notification_push)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, alertType, originCode || null, destinationCode || null,
       departureDateStart || null, departureDateEnd || null, targetPrice || null,
       currency, notificationEmail, notificationPush]
    );

    logger.info(`Alerte de prix créée: ${alertType} par utilisateur ${userId}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la création de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour une alerte
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      targetPrice,
      departureDateStart,
      departureDateEnd,
      notificationEmail,
      notificationPush,
      isActive
    } = req.body;

    const result = await db.query(
      `UPDATE price_alerts 
       SET target_price = COALESCE($1, target_price),
           departure_date_start = COALESCE($2, departure_date_start),
           departure_date_end = COALESCE($3, departure_date_end),
           notification_email = COALESCE($4, notification_email),
           notification_push = COALESCE($5, notification_push),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [targetPrice, departureDateStart, departureDateEnd, notificationEmail,
       notificationPush, isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerte introuvable' });
    }

    logger.info(`Alerte mise à jour: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer une alerte
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM price_alerts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerte introuvable' });
    }

    logger.info(`Alerte supprimée: ${id}`);
    res.json({ message: 'Alerte supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Activer/désactiver une alerte
exports.toggleAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE price_alerts 
       SET is_active = NOT is_active
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerte introuvable' });
    }

    logger.info(`Alerte basculée: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors du basculement de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
