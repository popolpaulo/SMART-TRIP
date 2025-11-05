/**
 * Base de données des compagnies aériennes
 * Code IATA -> Nom complet et URL de réservation
 */
export const AIRLINES = {
  // Compagnies européennes
  AF: {
    name: "Air France",
    fullName: "Air France",
    bookingUrl: "https://www.airfrance.fr",
    logo: "✈️",
  },
  KL: {
    name: "KLM",
    fullName: "KLM Royal Dutch Airlines",
    bookingUrl: "https://www.klm.com",
    logo: "✈️",
  },
  LH: {
    name: "Lufthansa",
    fullName: "Lufthansa",
    bookingUrl: "https://www.lufthansa.com",
    logo: "✈️",
  },
  BA: {
    name: "British Airways",
    fullName: "British Airways",
    bookingUrl: "https://www.britishairways.com",
    logo: "✈️",
  },
  IB: {
    name: "Iberia",
    fullName: "Iberia",
    bookingUrl: "https://www.iberia.com",
    logo: "✈️",
  },
  AZ: {
    name: "ITA Airways",
    fullName: "ITA Airways",
    bookingUrl: "https://www.ita-airways.com",
    logo: "✈️",
  },
  SN: {
    name: "Brussels Airlines",
    fullName: "Brussels Airlines",
    bookingUrl: "https://www.brusselsairlines.com",
    logo: "✈️",
  },
  TP: {
    name: "TAP Air Portugal",
    fullName: "TAP Air Portugal",
    bookingUrl: "https://www.flytap.com",
    logo: "✈️",
  },
  VY: {
    name: "Vueling",
    fullName: "Vueling Airlines",
    bookingUrl: "https://www.vueling.com",
    logo: "✈️",
  },
  U2: {
    name: "easyJet",
    fullName: "easyJet",
    bookingUrl: "https://www.easyjet.com",
    logo: "✈️",
  },
  FR: {
    name: "Ryanair",
    fullName: "Ryanair",
    bookingUrl: "https://www.ryanair.com",
    logo: "✈️",
  },
  DY: {
    name: "Norwegian",
    fullName: "Norwegian Air Shuttle",
    bookingUrl: "https://www.norwegian.com",
    logo: "✈️",
  },
  W6: {
    name: "Wizz Air",
    fullName: "Wizz Air",
    bookingUrl: "https://wizzair.com",
    logo: "✈️",
  },
  TO: {
    name: "Transavia",
    fullName: "Transavia",
    bookingUrl: "https://www.transavia.com",
    logo: "✈️",
  },

  // Compagnies américaines
  AA: {
    name: "American Airlines",
    fullName: "American Airlines",
    bookingUrl: "https://www.aa.com",
    logo: "✈️",
  },
  UA: {
    name: "United Airlines",
    fullName: "United Airlines",
    bookingUrl: "https://www.united.com",
    logo: "✈️",
  },
  DL: {
    name: "Delta Air Lines",
    fullName: "Delta Air Lines",
    bookingUrl: "https://www.delta.com",
    logo: "✈️",
  },
  B6: {
    name: "JetBlue",
    fullName: "JetBlue Airways",
    bookingUrl: "https://www.jetblue.com",
    logo: "✈️",
  },
  WN: {
    name: "Southwest",
    fullName: "Southwest Airlines",
    bookingUrl: "https://www.southwest.com",
    logo: "✈️",
  },
  AS: {
    name: "Alaska Airlines",
    fullName: "Alaska Airlines",
    bookingUrl: "https://www.alaskaair.com",
    logo: "✈️",
  },

  // Compagnies moyen-orientales
  EK: {
    name: "Emirates",
    fullName: "Emirates",
    bookingUrl: "https://www.emirates.com",
    logo: "✈️",
  },
  QR: {
    name: "Qatar Airways",
    fullName: "Qatar Airways",
    bookingUrl: "https://www.qatarairways.com",
    logo: "✈️",
  },
  EY: {
    name: "Etihad",
    fullName: "Etihad Airways",
    bookingUrl: "https://www.etihad.com",
    logo: "✈️",
  },
  TK: {
    name: "Turkish Airlines",
    fullName: "Turkish Airlines",
    bookingUrl: "https://www.turkishairlines.com",
    logo: "✈️",
  },

  // Compagnies asiatiques
  SQ: {
    name: "Singapore Airlines",
    fullName: "Singapore Airlines",
    bookingUrl: "https://www.singaporeair.com",
    logo: "✈️",
  },
  CX: {
    name: "Cathay Pacific",
    fullName: "Cathay Pacific",
    bookingUrl: "https://www.cathaypacific.com",
    logo: "✈️",
  },
  NH: {
    name: "ANA",
    fullName: "All Nippon Airways",
    bookingUrl: "https://www.ana.co.jp",
    logo: "✈️",
  },
  JL: {
    name: "JAL",
    fullName: "Japan Airlines",
    bookingUrl: "https://www.jal.co.jp",
    logo: "✈️",
  },
  TG: {
    name: "Thai Airways",
    fullName: "Thai Airways International",
    bookingUrl: "https://www.thaiairways.com",
    logo: "✈️",
  },
  MH: {
    name: "Malaysia Airlines",
    fullName: "Malaysia Airlines",
    bookingUrl: "https://www.malaysiaairlines.com",
    logo: "✈️",
  },

  // Compagnies canadiennes
  AC: {
    name: "Air Canada",
    fullName: "Air Canada",
    bookingUrl: "https://www.aircanada.com",
    logo: "✈️",
  },
  WS: {
    name: "WestJet",
    fullName: "WestJet",
    bookingUrl: "https://www.westjet.com",
    logo: "✈️",
  },

  // Compagnies océaniennes
  QF: {
    name: "Qantas",
    fullName: "Qantas Airways",
    bookingUrl: "https://www.qantas.com",
    logo: "✈️",
  },
  NZ: {
    name: "Air New Zealand",
    fullName: "Air New Zealand",
    bookingUrl: "https://www.airnewzealand.com",
    logo: "✈️",
  },

  // Compagnies africaines
  SA: {
    name: "South African Airways",
    fullName: "South African Airways",
    bookingUrl: "https://www.flysaa.com",
    logo: "✈️",
  },
  ET: {
    name: "Ethiopian Airlines",
    fullName: "Ethiopian Airlines",
    bookingUrl: "https://www.ethiopianairlines.com",
    logo: "✈️",
  },
  MS: {
    name: "EgyptAir",
    fullName: "EgyptAir",
    bookingUrl: "https://www.egyptair.com",
    logo: "✈️",
  },

  // Compagnies low-cost internationales
  W4: {
    name: "Wizz Air Malta",
    fullName: "Wizz Air Malta",
    bookingUrl: "https://wizzair.com",
    logo: "✈️",
  },
  VL: {
    name: "Air VIA",
    fullName: "Air VIA",
    bookingUrl: "https://www.airvia.com",
    logo: "✈️",
  },
};

/**
 * Obtenir les informations d'une compagnie aérienne
 * @param {string} code - Code IATA de la compagnie (2 lettres)
 * @returns {object} - Informations de la compagnie
 */
export const getAirlineInfo = (code) => {
  if (!code) return null;

  // Normaliser le code (majuscules, 2 caractères)
  const normalizedCode = code.trim().toUpperCase().slice(0, 2);

  const airline = AIRLINES[normalizedCode];

  if (airline) {
    return {
      code: normalizedCode,
      ...airline,
    };
  }

  // Si la compagnie n'est pas trouvée, retourner un objet par défaut
  return {
    code: normalizedCode,
    name: normalizedCode,
    fullName: `Compagnie ${normalizedCode}`,
    bookingUrl: `https://www.google.com/flights?q=${normalizedCode}`,
    logo: "✈️",
  };
};

/**
 * Générer un lien de réservation avec les paramètres de recherche
 * @param {object} flight - Données du vol
 * @param {object} searchParams - Paramètres de recherche (origin, destination, dates, etc.)
 * @returns {string} - URL de réservation
 */
export const generateBookingLink = (flight, searchParams) => {
  const airlineInfo = getAirlineInfo(
    flight.carrierIds?.[0] ||
      flight.validatingAirlineCodes?.[0] ||
      flight.airline
  );

  if (!airlineInfo) {
    // Fallback vers Google Flights
    const { origin, destination, departureDate, returnDate } = searchParams;
    return `https://www.google.com/flights?hl=fr#flt=${origin}.${destination}.${departureDate}${
      returnDate ? "*" + destination + "." + origin + "." + returnDate : ""
    };c:EUR;e:1;sd:1;t:f`;
  }

  // Si le vol a un deep link spécifique, l'utiliser
  if (flight.deepLink || flight.bookingUrl) {
    return flight.deepLink || flight.bookingUrl;
  }

  // Sinon, utiliser l'URL de base de la compagnie
  return airlineInfo.bookingUrl;
};
