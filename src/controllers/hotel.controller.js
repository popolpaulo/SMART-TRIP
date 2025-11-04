const db = require('../database/connection');
const logger = require('../utils/logger');

// Recherche d'hôtels
exports.searchHotels = async (req, res) => {
  try {
    const { city, countryCode, checkIn, checkOut, guests = 1 } = req.body;

    // TODO: Implémenter la recherche réelle via APIs externes
    
    logger.info(`Recherche d'hôtels: ${city}, ${countryCode}`);

    res.json({
      message: 'Fonctionnalité de recherche en développement',
      params: { city, countryCode, checkIn, checkOut, guests },
      hotels: []
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche d\'hôtels:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};

// Détails d'un hôtel
exports.getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM hotels WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hôtel introuvable' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'hôtel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Réserver un hôtel
exports.bookHotel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hotelId, tripId, roomType, checkIn, checkOut, guests, specialRequests } = req.body;

    const bookingRef = `STH${Date.now()}`;

    const result = await db.query(
      `INSERT INTO hotel_bookings 
       (user_id, hotel_id, trip_id, booking_reference, room_type, 
        check_in_date, check_out_date, guests_count, special_requests, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, hotelId, tripId || null, bookingRef, roomType, 
       checkIn, checkOut, guests, specialRequests || null, 0]
    );

    logger.info(`Réservation d'hôtel créée: ${bookingRef}`);
    
    res.status(201).json({
      message: 'Réservation créée',
      booking: result.rows[0]
    });
  } catch (error) {
    logger.error('Erreur lors de la réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
};
