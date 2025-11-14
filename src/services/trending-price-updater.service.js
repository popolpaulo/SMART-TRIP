const db = require("../database/connection");
const logger = require("../utils/logger");
const amadeusService = require("../services/amadeus.service");

/**
 * Service pour mettre à jour les prix réels des destinations tendances
 * Récupère les prix depuis les APIs de vols et met à jour la base de données
 */
class TrendingPriceUpdater {
  /**
   * Met à jour les prix de toutes les destinations tendances
   * À exécuter périodiquement (cron job ou manuel)
   */
  async updateAllPrices(originAirport = "CDG") {
    try {
      logger.info(
        "🔄 Début de la mise à jour des prix des destinations tendances..."
      );

      // 1. Récupérer toutes les destinations tendances
      const result = await db.query(
        "SELECT id, city, country_code, country_name FROM trending_destinations"
      );

      const destinations = result.rows;
      logger.info(`📍 ${destinations.length} destinations à mettre à jour`);

      const today = new Date();
      const departureDate = new Date(today);
      departureDate.setDate(today.getDate() + 14); // Dans 2 semaines
      const returnDate = new Date(departureDate);
      returnDate.setDate(departureDate.getDate() + 7); // 1 semaine de séjour

      const departureDateStr = departureDate.toISOString().split("T")[0];
      const returnDateStr = returnDate.toISOString().split("T")[0];

      let updatedCount = 0;
      let errors = 0;

      // 2. Pour chaque destination, récupérer le prix réel
      for (const destination of destinations) {
        try {
          const destinationAirport = this.getCityAirport(destination.city);

          if (!destinationAirport) {
            logger.warn(`⚠️ Aéroport inconnu pour ${destination.city}`);
            continue;
          }

          // Eviter les recherches vers le meme aeroport (ex: CDG -> CDG)
          if (
            destinationAirport.toUpperCase() ===
            String(originAirport).toUpperCase()
          ) {
            logger.warn(
              `⚠️ Destination identique a l'origine (${originAirport}). Passage ignore pour ${destination.city}`
            );
            continue;
          }

          logger.info(
            `🔍 Recherche de vols ${originAirport} → ${destinationAirport}...`
          );

          // Rechercher le prix le moins cher
          const flights = await amadeusService.searchFlights({
            origin: originAirport,
            destination: destinationAirport,
            departureDate: departureDateStr,
            returnDate: returnDateStr,
            adults: 1,
            travelClass: "ECONOMY",
            maxResults: 10,
          });

          if (flights && flights.length > 0) {
            // Trouver le prix minimum
            const prices = flights
              .map((f) => f.price?.total || f.price)
              .filter((p) => p > 0);

            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const avgPrice =
                prices.reduce((a, b) => a + b, 0) / prices.length;

              // Mettre à jour dans la base de données
              await db.query(
                `UPDATE trending_destinations 
                 SET average_price = $1,
                     min_price = $2,
                     last_price_update = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [Math.round(avgPrice), Math.round(minPrice), destination.id]
              );

              logger.info(
                `✅ ${destination.city}: ${Math.round(
                  minPrice
                )}€ - ${Math.round(avgPrice)}€ (${flights.length} vols)`
              );
              updatedCount++;
            } else {
              logger.warn(`⚠️ ${destination.city}: Aucun prix valide trouvé`);
            }
          } else {
            logger.warn(`⚠️ ${destination.city}: Aucun vol trouvé`);
          }

          // Pause pour éviter de surcharger l'API
          await this.sleep(2000);
        } catch (error) {
          logger.error(`❌ Erreur pour ${destination.city}:`, error.message);
          errors++;
          continue;
        }
      }

      logger.info(
        `🎉 Mise à jour terminée: ${updatedCount} destinations mises à jour, ${errors} erreurs`
      );

      return {
        success: true,
        updated: updatedCount,
        errors: errors,
        total: destinations.length,
      };
    } catch (error) {
      logger.error("❌ Erreur lors de la mise à jour des prix:", error);
      throw error;
    }
  }

  /**
   * Met à jour le prix d'une seule destination
   */
  async updateSingleDestination(city, originAirport = "CDG") {
    try {
      const destinationAirport = this.getCityAirport(city);

      if (!destinationAirport) {
        throw new Error(`Aéroport inconnu pour ${city}`);
      }

      const today = new Date();
      const departureDate = new Date(today);
      departureDate.setDate(today.getDate() + 14);
      const returnDate = new Date(departureDate);
      returnDate.setDate(departureDate.getDate() + 7);

      const flights = await amadeusService.searchFlights({
        origin: originAirport,
        destination: destinationAirport,
        departureDate: departureDate.toISOString().split("T")[0],
        returnDate: returnDate.toISOString().split("T")[0],
        adults: 1,
        travelClass: "ECONOMY",
        maxResults: 10,
      });

      if (flights && flights.length > 0) {
        const prices = flights
          .map((f) => f.price?.total || f.price)
          .filter((p) => p > 0);

        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

          await db.query(
            `UPDATE trending_destinations 
             SET average_price = $1,
                 min_price = $2,
                 last_price_update = CURRENT_TIMESTAMP
             WHERE LOWER(city) = LOWER($3)`,
            [Math.round(avgPrice), Math.round(minPrice), city]
          );

          return {
            success: true,
            city,
            minPrice: Math.round(minPrice),
            avgPrice: Math.round(avgPrice),
            flightsFound: flights.length,
          };
        }
      }

      throw new Error("Aucun vol trouvé");
    } catch (error) {
      logger.error(`Erreur pour ${city}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtenir le code aéroport principal d'une ville
   */
  getCityAirport(city) {
    const airportMap = {
      // Europe
      Paris: "CDG",
      London: "LHR",
      Lisbonne: "LIS",
      Rome: "FCO",
      Barcelona: "BCN",
      Madrid: "MAD",
      Amsterdam: "AMS",
      Berlin: "BER",
      Vienna: "VIE",
      Prague: "PRG",

      // Amérique
      "New York": "JFK",
      "Los Angeles": "LAX",
      Miami: "MIA",
      Toronto: "YYZ",
      Mexico: "MEX",

      // Asie
      Tokyo: "NRT",
      Singapore: "SIN",
      Dubai: "DXB",
      Dubaï: "DXB",
      Bangkok: "BKK",
      "Hong Kong": "HKG",
      Shanghai: "PVG",
      Bali: "DPS",
      Seoul: "ICN",

      // Afrique
      Marrakech: "RAK",
      Cairo: "CAI",

      // Océanie
      Sydney: "SYD",
      Melbourne: "MEL",
      Auckland: "AKL",
    };

    return airportMap[city] || null;
  }

  /**
   * Pause asynchrone
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new TrendingPriceUpdater();
