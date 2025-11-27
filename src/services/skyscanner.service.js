const axios = require("axios");
const logger = require("../utils/logger");

/**
 * Service Skyscanner API
 * Documentation: https://developers.skyscanner.net/
 */
class SkyscannerService {
  constructor() {
    this.apiKey = process.env.SKYSCANNER_API_KEY;
    this.baseURL =
      process.env.SKYSCANNER_BASE_URL || "https://partners.api.skyscanner.net";
  }

  /**
   * Rechercher des vols
   */
  async searchFlights(searchParams) {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      cabinClass = "economy",
    } = searchParams;

    try {
      // Note: Skyscanner nécessite souvent un processus en 2 étapes (création session + polling)
      // Ceci est une implémentation simplifiée

      const params = {
        apikey: this.apiKey,
        country: "FR",
        currency: "EUR",
        locale: "fr-FR",
        originplace: origin,
        destinationplace: destination,
        outbounddate: departureDate,
        adults,
        cabinclass: cabinClass,
      };

      if (returnDate) {
        params.inbounddate = returnDate;
      }

      const response = await axios.get(
        `${this.baseURL}/apiservices/browseroutes/v1.0`,
        {
          params,
        }
      );

      logger.info(`Skyscanner flight search: ${origin} -> ${destination}`);

      return this.formatFlightOffers(response.data.Quotes || [], response.data);
    } catch (error) {
      logger.error(
        "Skyscanner API error:",
        error.response?.data || error.message
      );
      logger.warn("Using Skyscanner mock data fallback");
      return this.getMockFlightData(searchParams);
    }
  }

  /**
   * Formater les offres de vols
   */
  formatFlightOffers(quotes, fullData) {
    return quotes.map((quote) => ({
      id: `sky-${quote.QuoteId}`,
      source: "skyscanner",
      price: {
        total: quote.MinPrice,
        currency: fullData.Currencies?.[0]?.Code || "EUR",
        perAdult: quote.MinPrice,
      },
      outbound: {
        departure: {
          airport: quote.OutboundLeg?.OriginId,
          time: quote.OutboundLeg?.DepartureDate,
        },
        arrival: {
          airport: quote.OutboundLeg?.DestinationId,
          time: null, // Skyscanner browse API ne fournit pas toujours ces détails
        },
        stops: quote.OutboundLeg?.Stops?.length || 0,
        segments: [],
      },
      inbound: quote.InboundLeg
        ? {
            departure: {
              airport: quote.InboundLeg.OriginId,
              time: quote.InboundLeg.DepartureDate,
            },
            arrival: {
              airport: quote.InboundLeg.DestinationId,
              time: null,
            },
            stops: quote.InboundLeg.Stops?.length || 0,
            segments: [],
          }
        : null,
      direct: quote.Direct,
      carrierIds: quote.OutboundLeg?.CarrierIds || [],
    }));
  }

  /**
   * Données de test
   */
  getMockFlightData(searchParams) {
    const basePrice = 180 + Math.random() * 450;

    return [
      {
        id: "sky-mock-1",
        source: "skyscanner-mock",
        price: {
          total: basePrice,
          currency: "EUR",
          perAdult: basePrice,
        },
        outbound: {
          departure: {
            airport: searchParams.origin,
            time: `${searchParams.departureDate}T09:00:00`,
          },
          arrival: {
            airport: searchParams.destination,
            time: `${searchParams.departureDate}T13:30:00`,
          },
          stops: 0,
          segments: [],
        },
        inbound: searchParams.returnDate
          ? {
              departure: {
                airport: searchParams.destination,
                time: `${searchParams.returnDate}T15:00:00`,
              },
              arrival: {
                airport: searchParams.origin,
                time: `${searchParams.returnDate}T19:30:00`,
              },
              stops: 0,
              segments: [],
            }
          : null,
        direct: true,
        carrierIds: ["BA"],
      },
    ];
  }
}

module.exports = new SkyscannerService();
