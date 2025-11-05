const OpenAI = require("openai");
const logger = require("../utils/logger");
const pool = require("../database/connection");

/**
 * Service d'Intelligence Artificielle
 * Analyse les profils utilisateurs et recommande les meilleurs vols
 */
class AIService {
  constructor() {
    this.openai =
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "votre_cle_openai"
        ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        : null;

    this.model = process.env.AI_MODEL || "gpt-4";
    this.enabled = process.env.AI_PREDICTION_ENABLED === "true";
  }

  /**
   * Analyser le profil utilisateur et scorer les vols
   * @param {Object} user - Profil utilisateur (peut être null pour anonymous)
   * @param {Array} flights - Liste des vols disponibles
   * @param {Object} searchParams - Paramètres de recherche
   * @returns {Promise<Array>} - Vols scorés et triés par pertinence
   */
  async scoreFlights(user, flights, searchParams) {
    try {
      // Récupérer le profil complet de l'utilisateur (ou utiliser des valeurs par défaut)
      const userProfile = user?.id
        ? await this.getUserProfile(user.id)
        : this.getDefaultProfile();

      // Scorer chaque vol
      const scoredFlights = flights.map((flight) => {
        const score = this.calculateFlightScore(
          flight,
          userProfile,
          searchParams
        );
        return {
          ...flight,
          aiScore: score.total,
          aiRecommendation: score.recommendation,
          scoreBreakdown: score.breakdown,
        };
      });

      // Trier par score décroissant
      scoredFlights.sort((a, b) => b.aiScore - a.aiScore);

      logger.info(
        `AI scored ${flights.length} flights for user ${
          user?.id || "anonymous"
        }`
      );
      return scoredFlights;
    } catch (error) {
      logger.error("AI scoring error:", error.message);
      return flights; // Retourner les vols non scorés en cas d'erreur
    }
  }

  /**
   * Récupérer le profil utilisateur complet
   */
  async getUserProfile(userId) {
    try {
      const result = await pool.query(
        `
        SELECT 
          u.id,
          u.email,
          up.budget_preference,
          up.comfort_preference,
          up.max_layovers,
          up.preferred_airlines,
          up.preferred_airports,
          up.seat_preference,
          up.meal_preference,
          (
            SELECT json_agg(json_build_object(
              'destination', destination,
              'departure_date', departure_date,
              'passengers', passengers
            ))
            FROM flight_searches
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 10
          ) as search_history,
          (
            SELECT json_agg(json_build_object(
              'origin', origin,
              'destination', destination,
              'price', total_price
            ))
            FROM flight_bookings
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 5
          ) as booking_history
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `,
        [userId]
      );

      return result.rows[0] || {};
    } catch (error) {
      logger.error("Error fetching user profile:", error.message);
      return {};
    }
  }

  /**
   * Obtenir un profil par défaut pour les utilisateurs anonymes
   */
  getDefaultProfile() {
    return {
      budget_preference: "moderate",
      comfort_preference: "standard",
      max_layovers: 1,
      preferred_airlines: [],
      preferred_airports: [],
      seat_preference: "no_preference",
      meal_preference: null,
      search_history: [],
      booking_history: [],
    };
  }

  /**
   * Calculer le score d'un vol basé sur les préférences utilisateur
   */
  calculateFlightScore(flight, userProfile, searchParams) {
    const weights = {
      price: 0.35,
      comfort: 0.2,
      layovers: 0.15,
      duration: 0.15,
      airline: 0.1,
      timing: 0.05,
    };

    const breakdown = {};

    // 1. Score Prix (inversé: moins cher = meilleur score)
    const budgetPreference = userProfile.budget_preference || "medium";
    const maxBudget = this.getBudgetLimit(budgetPreference, searchParams);
    breakdown.price = Math.max(0, 100 - (flight.price.total / maxBudget) * 100);

    // 2. Score Confort (basé sur classe de voyage, escales)
    const comfortPreference = userProfile.comfort_preference || "economy";
    breakdown.comfort = this.calculateComfortScore(flight, comfortPreference);

    // 3. Score Escales (moins d'escales = mieux)
    const maxLayovers = userProfile.max_layovers || 2;
    const actualLayovers = flight.outbound.stops + (flight.inbound?.stops || 0);
    breakdown.layovers =
      actualLayovers <= maxLayovers
        ? 100 - actualLayovers * 25
        : 50 - actualLayovers * 10;

    // 4. Score Durée (plus court = mieux)
    breakdown.duration = this.calculateDurationScore(flight);

    // 5. Score Compagnie aérienne (préférences utilisateur)
    breakdown.airline = this.calculateAirlineScore(
      flight,
      userProfile.preferred_airlines
    );

    // 6. Score Horaires (basé sur les horaires préférés)
    breakdown.timing = this.calculateTimingScore(flight);

    // Calculer le score total pondéré
    const total = Object.keys(weights).reduce((sum, key) => {
      return sum + breakdown[key] * weights[key];
    }, 0);

    // Générer une recommandation
    const recommendation = this.generateRecommendation(
      total,
      breakdown,
      userProfile
    );

    return {
      total: Math.round(total),
      breakdown,
      recommendation,
    };
  }

  /**
   * Obtenir la limite budgétaire selon la préférence
   */
  getBudgetLimit(budgetPreference, searchParams) {
    const basePrice = 300; // Prix de base pour un vol moyen
    const multipliers = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
      luxury: 2.5,
    };

    return basePrice * (multipliers[budgetPreference] || 1.0);
  }

  /**
   * Calculer le score de confort
   */
  calculateComfortScore(flight, comfortPreference) {
    const comfortLevels = {
      economy: 60,
      premium_economy: 75,
      business: 90,
      first_class: 100,
    };

    // Score de base selon la classe
    let score = comfortLevels[comfortPreference] || 60;

    // Bonus si vol direct
    if (
      flight.outbound.stops === 0 &&
      (!flight.inbound || flight.inbound.stops === 0)
    ) {
      score += 10;
    }

    // Bonus pour les gros porteurs (plus confortables)
    const hasWidebody = flight.outbound.segments?.some((seg) =>
      ["747", "777", "787", "380", "A350"].some((type) =>
        seg.aircraft?.includes(type)
      )
    );
    if (hasWidebody) {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculer le score de durée
   */
  calculateDurationScore(flight) {
    // Convertir la durée ISO 8601 en minutes
    const getTotalMinutes = (duration) => {
      if (!duration) return 0;
      const match = duration.match(/PT(\d+H)?(\d+M)?/);
      if (!match) return 0;

      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      return hours * 60 + minutes;
    };

    const outboundMinutes = getTotalMinutes(flight.outbound.duration);
    const inboundMinutes = flight.inbound
      ? getTotalMinutes(flight.inbound.duration)
      : 0;
    const totalMinutes = outboundMinutes + inboundMinutes;

    // Score inversement proportionnel à la durée
    // 4h = 100 points, 8h = 75 points, 12h = 50 points, 20h+ = 25 points
    if (totalMinutes <= 240) return 100;
    if (totalMinutes <= 480) return 75;
    if (totalMinutes <= 720) return 50;
    return Math.max(25, 100 - totalMinutes / 20);
  }

  /**
   * Calculer le score de compagnie aérienne
   */
  calculateAirlineScore(flight, preferredAirlines) {
    if (!preferredAirlines || preferredAirlines.length === 0) {
      return 70; // Score neutre
    }

    const flightCarriers = flight.validatingAirlineCodes || [];
    const hasPreferred = flightCarriers.some((carrier) =>
      preferredAirlines.includes(carrier)
    );

    return hasPreferred ? 100 : 50;
  }

  /**
   * Calculer le score d'horaires
   */
  calculateTimingScore(flight) {
    const departureTime = new Date(flight.outbound.departure.time);
    const hour = departureTime.getHours();

    // Horaires préférés: 8h-12h et 14h-18h = meilleur score
    // Nuit (0h-6h) = moins bon score
    if (hour >= 8 && hour <= 12) return 100;
    if (hour >= 14 && hour <= 18) return 90;
    if (hour >= 6 && hour <= 8) return 80;
    if (hour >= 18 && hour <= 22) return 75;
    return 50; // Départs très tôt ou très tard
  }

  /**
   * Générer une recommandation textuelle
   */
  generateRecommendation(score, breakdown, userProfile) {
    if (score >= 85) {
      return {
        level: "excellent",
        message: "Vol hautement recommandé selon vos préférences",
        highlights: this.getHighlights(breakdown),
      };
    } else if (score >= 70) {
      return {
        level: "good",
        message: "Bon compromis qualité-prix",
        highlights: this.getHighlights(breakdown),
      };
    } else if (score >= 55) {
      return {
        level: "acceptable",
        message: "Option acceptable avec quelques compromis",
        highlights: this.getHighlights(breakdown),
      };
    } else {
      return {
        level: "poor",
        message: "Pas optimal selon vos préférences",
        highlights: [],
      };
    }
  }

  /**
   * Extraire les points forts d'un vol
   */
  getHighlights(breakdown) {
    const highlights = [];

    if (breakdown.price >= 80) highlights.push("Excellent prix");
    if (breakdown.layovers >= 90) highlights.push("Vol direct");
    if (breakdown.comfort >= 85) highlights.push("Confort optimal");
    if (breakdown.duration >= 80) highlights.push("Durée courte");
    if (breakdown.airline >= 90) highlights.push("Compagnie préférée");

    return highlights;
  }

  /**
   * Prédire l'évolution des prix avec OpenAI (si configuré)
   */
  async predictPriceEvolution(searchParams, historicalData) {
    if (!this.openai || !this.enabled) {
      return this.getBasicPricePrediction(historicalData);
    }

    try {
      const prompt = this.buildPricePredictionPrompt(
        searchParams,
        historicalData
      );

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "Tu es un expert en prédiction de prix de vols. Analyse les données historiques et prédit l'évolution des prix.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const prediction = JSON.parse(completion.choices[0].message.content);

      logger.info("AI price prediction generated");
      return prediction;
    } catch (error) {
      logger.error("OpenAI prediction error:", error.message);
      return this.getBasicPricePrediction(historicalData);
    }
  }

  /**
   * Construire le prompt pour la prédiction de prix
   */
  buildPricePredictionPrompt(searchParams, historicalData) {
    return `
Analyse ces données de vol et prédit l'évolution des prix:

Route: ${searchParams.origin} → ${searchParams.destination}
Date de départ: ${searchParams.departureDate}
Date de retour: ${searchParams.returnDate || "N/A"}

Données historiques des 30 derniers jours:
${JSON.stringify(historicalData, null, 2)}

Réponds au format JSON avec:
{
  "currentTrend": "increasing|decreasing|stable",
  "predictedPriceIn7Days": number,
  "predictedPriceIn14Days": number,
  "predictedPriceIn30Days": number,
  "recommendation": "book_now|wait_1week|wait_2weeks|monitor",
  "confidence": "high|medium|low",
  "reasoning": "explication courte"
}
    `;
  }

  /**
   * Prédiction basique sans IA (fallback)
   */
  getBasicPricePrediction(historicalData) {
    const avgPrice =
      historicalData.reduce((sum, d) => sum + d.price, 0) /
      historicalData.length;
    const currentPrice =
      historicalData[historicalData.length - 1]?.price || avgPrice;

    const trend =
      currentPrice < avgPrice * 0.9
        ? "decreasing"
        : currentPrice > avgPrice * 1.1
        ? "increasing"
        : "stable";

    return {
      currentTrend: trend,
      predictedPriceIn7Days:
        currentPrice * (trend === "increasing" ? 1.05 : 0.98),
      predictedPriceIn14Days:
        currentPrice * (trend === "increasing" ? 1.08 : 0.96),
      predictedPriceIn30Days:
        currentPrice * (trend === "increasing" ? 1.12 : 0.94),
      recommendation: trend === "decreasing" ? "wait_1week" : "book_now",
      confidence: "low",
      reasoning: "Prédiction basique basée sur la moyenne historique",
    };
  }
}

module.exports = new AIService();
