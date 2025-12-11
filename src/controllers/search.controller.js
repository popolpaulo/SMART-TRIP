const db = require("../database/connection");
const logger = require("../utils/logger");
const flightAggregator = require("../services/flight-aggregator.service");
const aiService = require("../services/ai.service");
const { resolveAirport } = require("../utils/ns_airports");

// Recherche globale (agrège vols + placeholders hôtels/activités)
exports.globalSearch = async (req, res) => {
  try {
    const {
      query,
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = "ECONOMY",
      maxBudget,
      maxDurationHours,
      maxStops,
      type = "all",
    } = req.body;

    let flights = [];
    let flightMeta = null;
    const user = req.user || null;

    // Si paramètres explicites de vol fournis, lancer une smartSearch
    if (origin && destination && departureDate) {
      try {
        const searchParams = {
          origin: resolveAirport(origin) || origin,
          destination: resolveAirport(destination) || destination,
          departureDate,
          returnDate: returnDate || null,
          adults,
          travelClass,
        };
        const result = await flightAggregator.smartSearch(user, searchParams);
        flights = result.flights;
        flightMeta = result.meta;
      } catch (e) {
        logger.warn("Global search - smartSearch failed:", e.message);
      }
    } else if (query && origin && departureDate) {
      // Tentative simple: interpréter query comme destination (ville) -> mapping basique airport
      const destAirport = resolveAirport(destination) || resolveAirport(query);
      if (destAirport) {
        try {
          const searchParams = {
            origin: resolveAirport(origin) || origin,
            destination: destAirport,
            departureDate,
            returnDate: returnDate || null,
            adults,
            travelClass,
          };
          const result = await flightAggregator.smartSearch(user, searchParams);
          flights = result.flights;
          flightMeta = result.meta;
        } catch (e) {
          logger.warn("Global search (query mapping) failed:", e.message);
        }
      }
    }

    // Application des filtres côté API si fournis
    let filteredFlights = flights;

    if (typeof maxBudget === "number") {
      filteredFlights = filteredFlights.filter(
        (f) => f.price && f.price.total <= maxBudget
      );
    }

    if (typeof maxStops === "number") {
      filteredFlights = filteredFlights.filter((f) => {
        const outboundStops = f.outbound?.stops ?? 0;
        const inboundStops = f.inbound?.stops ?? 0;
        return outboundStops + inboundStops <= maxStops;
      });
    }

    if (typeof maxDurationHours === "number") {
      const toMinutes = (duration) => {
        if (!duration) return 0;
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        if (!match) return 0;
        const h = match[1] ? parseInt(match[1]) : 0;
        const m = match[2] ? parseInt(match[2]) : 0;
        return h * 60 + m;
      };

      const maxMinutes = maxDurationHours * 60;
      filteredFlights = filteredFlights.filter((f) => {
        const out = toMinutes(f.outbound?.duration);
        const inn = toMinutes(f.inbound?.duration);
        return out + inn <= maxMinutes;
      });
    }

    logger.info(
      `Recherche globale exécutée (query=${query || "n/a"}) type=${type} vols=${
        filteredFlights.length
      }`
    );

    return res.json({
      query: query || null,
      type,
      results: {
        flights: filteredFlights,
        hotels: [], // TODO: intégrer vraie recherche hôtels
        activities: [], // TODO: intégrer activités
      },
      meta: {
        flights: flightMeta,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Erreur lors de la recherche globale:", error);
    return res.status(500).json({ error: "Erreur serveur" });
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
    logger.error("Erreur lors de la récupération des tendances:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Destinations populaires basées sur les recherches réelles
exports.getPopularDestinations = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await db.query(
      `SELECT * FROM popular_destinations 
       ORDER BY search_count DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({ destinations: result.rows });
  } catch (error) {
    logger.error("Erreur lors de la récupération des destinations populaires:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Suggestions basées sur l'IA (vols recommandés vers destinations tendances)
exports.getAISuggestions = async (req, res) => {
  try {
    const user = req.user || null;
    const {
      departureAirport = "CDG", // point de départ par défaut
      maxSuggestions = 5,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = "ECONOMY",
    } = req.body;

    // Récupérer les destinations tendances les plus élevées
    const trending = await db.query(
      `SELECT city, country_code, trend_score, average_price, season
       FROM trending_destinations
       WHERE trend_score IS NOT NULL
       ORDER BY trend_score DESC, search_count DESC
       LIMIT $1`,
      [Math.max(maxSuggestions * 2, 10)] // suréchantillonner puis filtrer
    );

    // Mapping simplifié ville -> aéroport (prototype)
    const cityToAirport = {
      Paris: "CDG",
      Londres: "LHR",
      London: "LHR",
      Madrid: "MAD",
      Rome: "FCO",
      Berlin: "BER",
      Barcelone: "BCN",
      Barcelona: "BCN",
      Lisbonne: "LIS",
      Lisbon: "LIS",
      Amsterdam: "AMS",
      NewYork: "JFK",
      "New York": "JFK",
    };

    const suggestions = [];
    const baseDepartureDate =
      departureDate ||
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // +30 jours
        .toISOString()
        .split("T")[0];
    const baseReturnDate =
      returnDate ||
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 37) // +37 jours
        .toISOString()
        .split("T")[0];

    for (const row of trending.rows) {
      const airport = cityToAirport[row.city];
      if (!airport) continue; // pas de mapping -> ignorer

      const searchParams = {
        origin: departureAirport,
        destination: airport,
        departureDate: baseDepartureDate,
        returnDate: baseReturnDate,
        adults,
        travelClass,
      };

      try {
        const result = await flightAggregator.smartSearch(user, searchParams);
        const bestFlight = result.flights[0];
        if (!bestFlight) continue;
        const suggestion = {
          city: row.city,
          country: row.country_code,
          trendScore: row.trend_score,
          season: row.season,
          averagePrice: row.average_price,
          destinationAirport: airport,
          flight: {
            id: bestFlight.id,
            price: bestFlight.price,
            aiScore: bestFlight.aiScore,
            recommendation: bestFlight.aiRecommendation,
            outbound: bestFlight.outbound,
            inbound: bestFlight.inbound,
          },
        };

        suggestions.push(suggestion);

        // Persister dans ai_logs pour audit/analytics (non bloquant)
        try {
          await db.query(
            `INSERT INTO ai_logs (user_id, action_type, input_data, output_data, model_version, confidence_score, execution_time_ms)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              user?.id || null,
              "suggestion",
              JSON.stringify({
                searchParams,
                trending: {
                  city: row.city,
                  country: row.country_code,
                  trendScore: row.trend_score,
                },
              }),
              JSON.stringify(suggestion),
              process.env.AI_MODEL || "rules-engine",
              bestFlight.aiRecommendation?.level === "excellent"
                ? 0.9
                : bestFlight.aiRecommendation?.level === "good"
                ? 0.75
                : 0.6,
              result.meta?.searchTime || null,
            ]
          );
        } catch (logError) {
          logger.warn(
            `Erreur lors de l'enregistrement AI logs (suggestions): ${logError.message}`
          );
        }
      } catch (e) {
        logger.warn(`Suggestion search failed for ${row.city}: ${e.message}`);
      }

      if (suggestions.length >= maxSuggestions) break;
    }

    // Trier par score IA puis trend_score
    suggestions.sort((a, b) => {
      const scoreDiff = (b.flight?.aiScore || 0) - (a.flight?.aiScore || 0);
      return scoreDiff !== 0
        ? scoreDiff
        : (b.trendScore || 0) - (a.trendScore || 0);
    });

    logger.info(`Suggestions IA générées: ${suggestions.length}`);

    return res.json({
      suggestions,
      meta: {
        departureAirport,
        departureDate: baseDepartureDate,
        returnDate: baseReturnDate,
        totalCandidates: trending.rows.length,
        generated: suggestions.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Erreur lors des suggestions IA:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// Autocomplete pour les villes/aéroports
exports.autocomplete = async (req, res) => {
  try {
    const { q, type = "all" } = req.query;

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
    logger.error("Erreur lors de l'autocomplete:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
