const db = require("../database/connection");
const { logger } = require("../utils/logger");

/**
 * Ajouter un vol aux favoris
 */
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      airlineCode,
      airlineName,
      flightNumber,
      originCode,
      originCity,
      destinationCode,
      destinationCity,
      departureDatetime,
      arrivalDatetime,
      durationMinutes,
      stops,
      cabinClass,
      priceAmount,
      priceCurrency,
      baggageAllowance,
      isRefundable,
      carbonFootprintKg,
      userNotes,
    } = req.body;

    // Vérifier si le favori existe déjà
    const existingFavorite = await db.query(
      `SELECT id FROM user_favorite_flights 
       WHERE user_id = $1 AND airline_code = $2 AND flight_number = $3 AND departure_datetime = $4`,
      [userId, airlineCode, flightNumber, departureDatetime]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(409).json({
        error: "Ce vol est déjà dans vos favoris",
      });
    }

    // Ajouter le favori
    const result = await db.query(
      `INSERT INTO user_favorite_flights (
        user_id, airline_code, airline_name, flight_number,
        origin_code, origin_city, destination_code, destination_city,
        departure_datetime, arrival_datetime, duration_minutes, stops,
        cabin_class, price_amount, price_currency, baggage_allowance,
        is_refundable, carbon_footprint_kg, user_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        userId,
        airlineCode,
        airlineName,
        flightNumber,
        originCode,
        originCity,
        destinationCode,
        destinationCity,
        departureDatetime,
        arrivalDatetime,
        durationMinutes,
        stops,
        cabinClass,
        priceAmount,
        priceCurrency,
        baggageAllowance,
        isRefundable,
        carbonFootprintKg,
        userNotes,
      ]
    );

    logger.info(
      `Vol ajouté aux favoris: ${flightNumber} pour l'utilisateur ${userId}`
    );

    res.status(201).json({
      message: "Vol ajouté aux favoris avec succès",
      favorite: result.rows[0],
    });
  } catch (error) {
    logger.error("Erreur lors de l'ajout du favori:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout du favori",
    });
  }
};

/**
 * Récupérer tous les favoris d'un utilisateur
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, sortBy = "created_at", order = "DESC" } = req.query;

    const validSortColumns = ["created_at", "departure_datetime", "price_amount"];
    const validOrders = ["ASC", "DESC"];

    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    const result = await db.query(
      `SELECT 
        id, airline_code, airline_name, flight_number,
        origin_code, origin_city, destination_code, destination_city,
        departure_datetime, arrival_datetime, duration_minutes, stops,
        cabin_class, price_amount, price_currency, baggage_allowance,
        is_refundable, carbon_footprint_kg, user_notes,
        created_at, updated_at
      FROM user_favorite_flights
      WHERE user_id = $1
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Compter le total
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM user_favorite_flights WHERE user_id = $1`,
      [userId]
    );

    res.json({
      favorites: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    logger.error("Erreur lors de la récupération des favoris:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des favoris",
    });
  }
};

/**
 * Récupérer un favori spécifique
 */
exports.getFavoriteById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM user_favorite_flights WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Favori non trouvé",
      });
    }

    res.json({
      favorite: result.rows[0],
    });
  } catch (error) {
    logger.error("Erreur lors de la récupération du favori:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du favori",
    });
  }
};

/**
 * Mettre à jour un favori (notes utilisateur)
 */
exports.updateFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { userNotes } = req.body;

    const result = await db.query(
      `UPDATE user_favorite_flights 
       SET user_notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [userNotes, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Favori non trouvé",
      });
    }

    logger.info(`Favori mis à jour: ${id} pour l'utilisateur ${userId}`);

    res.json({
      message: "Favori mis à jour avec succès",
      favorite: result.rows[0],
    });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour du favori:", error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour du favori",
    });
  }
};

/**
 * Supprimer un favori
 */
exports.deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM user_favorite_flights WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Favori non trouvé",
      });
    }

    logger.info(`Favori supprimé: ${id} pour l'utilisateur ${userId}`);

    res.json({
      message: "Favori supprimé avec succès",
    });
  } catch (error) {
    logger.error("Erreur lors de la suppression du favori:", error);
    res.status(500).json({
      error: "Erreur lors de la suppression du favori",
    });
  }
};

/**
 * Vérifier si un vol est dans les favoris
 */
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { airlineCode, flightNumber, departureDatetime } = req.query;

    const result = await db.query(
      `SELECT id FROM user_favorite_flights 
       WHERE user_id = $1 AND airline_code = $2 AND flight_number = $3 AND departure_datetime = $4`,
      [userId, airlineCode, flightNumber, departureDatetime]
    );

    res.json({
      isFavorite: result.rows.length > 0,
      favoriteId: result.rows.length > 0 ? result.rows[0].id : null,
    });
  } catch (error) {
    logger.error("Erreur lors de la vérification du favori:", error);
    res.status(500).json({
      error: "Erreur lors de la vérification du favori",
    });
  }
};
