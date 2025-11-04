const db = require('../database/connection');
const logger = require('../utils/logger');

// Recherche de vols (stub - à connecter aux APIs réelles)
exports.searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers = { adults: 1, children: 0, infants: 0 },
      cabinClass = 'economy',
      isFlexible = false
    } = req.body;

    const userId = req.user?.id || null;

    // Enregistrer la recherche
    const searchResult = await db.query(
      `INSERT INTO flight_searches 
       (user_id, origin_code, destination_code, departure_date, return_date, 
        passengers_adults, passengers_children, passengers_infants, cabin_class, is_flexible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        userId, origin, destination, departureDate, returnDate || null,
        passengers.adults, passengers.children, passengers.infants,
        cabinClass, isFlexible
      ]
    );

    const searchId = searchResult.rows[0].id;

    // TODO: Implémenter la recherche réelle via APIs externes
    // TODO: Implémenter la recherche multi-VPN pour les meilleurs prix
    // Pour l'instant, retourner des résultats de test

    logger.info(`Recherche de vols: ${origin} -> ${destination} (${departureDate})`);

    res.json({
      searchId,
      message: 'Fonctionnalité de recherche en développement',
      params: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        cabinClass
      },
      flights: [] // Résultats vides pour l'instant
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche de vols:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};

// Détails d'un vol
exports.getFlightDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM flight_results WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vol introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la récupération du vol:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Réserver un vol
exports.bookFlight = async (req, res) => {
  try {
    const userId = req.user.id;
    const { flightResultId, tripId, passengers } = req.body;

    // TODO: Implémenter la logique de réservation réelle
    
    const bookingRef = `ST${Date.now()}`;

    const result = await db.query(
      `INSERT INTO flight_bookings 
       (user_id, flight_result_id, trip_id, booking_reference, passengers, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, flightResultId, tripId || null, bookingRef, JSON.stringify(passengers), 0]
    );

    logger.info(`Réservation de vol créée: ${bookingRef}`);
    
    res.status(201).json({
      message: 'Réservation en cours de traitement',
      booking: result.rows[0]
    });
  } catch (error) {
    logger.error('Erreur lors de la réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
};

// Historique des recherches
exports.getUserSearches = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM flight_searches 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
