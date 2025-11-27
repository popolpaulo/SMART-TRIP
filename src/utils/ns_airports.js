// ns_airports.js - utilitaire non significatif pour mapping ville/code IATA

const cityToAirport = {
  // Europe
  Paris: "CDG",
  PAR: "CDG",
  "Paris Orly": "ORY",
  Londres: "LHR",
  London: "LHR",
  LON: "LHR",
  Madrid: "MAD",
  MAD: "MAD",
  Barcelone: "BCN",
  Barcelona: "BCN",
  BCN: "BCN",
  Rome: "FCO",
  ROM: "FCO",
  Milan: "MXP",
  Berlin: "BER",
  BER: "BER",
  Amsterdam: "AMS",
  AMS: "AMS",
  Lisbonne: "LIS",
  Lisbon: "LIS",
  LIS: "LIS",
  Bruxelles: "BRU",
  Brussels: "BRU",
  BRU: "BRU",

  // Amérique du Nord
  "New York": "JFK",
  NewYork: "JFK",
  NYC: "JFK",
  JFK: "JFK",
  "Los Angeles": "LAX",
  LAX: "LAX",
  Miami: "MIA",
  MIA: "MIA",
  Montreal: "YUL",
  Toronto: "YYZ",

  // Asie
  Tokyo: "HND",
  Osaka: "KIX",
  Bangkok: "BKK",
  Singapour: "SIN",
  Singapore: "SIN",

  // Autres
  Dubaï: "DXB",
  Dubai: "DXB",
};

function resolveAirport(codeOrCity) {
  if (!codeOrCity) return null;
  if (typeof codeOrCity !== "string") return null;

  const trimmed = codeOrCity.trim();
  if (!trimmed) return null;

  // Si déjà un code IATA (3 lettres), on retourne tel quel
  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Sinon on cherche dans le mapping (clé exacte)
  return cityToAirport[trimmed] || null;
}

module.exports = {
  cityToAirport,
  resolveAirport,
};
