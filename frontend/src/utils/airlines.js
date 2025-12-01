/**
 * Base de données complète des compagnies aériennes
 * Logos CDN: https://images.kiwi.com/airlines/64/{CODE}.png
 */

export const airlines = {
  // Compagnies européennes
  AF: { name: "Air France", logo: "https://images.kiwi.com/airlines/64/AF.png", booking: "https://www.airfrance.fr" },
  BA: { name: "British Airways", logo: "https://images.kiwi.com/airlines/64/BA.png", booking: "https://www.britishairways.com" },
  LH: { name: "Lufthansa", logo: "https://images.kiwi.com/airlines/64/LH.png", booking: "https://www.lufthansa.com" },
  KL: { name: "KLM", logo: "https://images.kiwi.com/airlines/64/KL.png", booking: "https://www.klm.com" },
  IB: { name: "Iberia", logo: "https://images.kiwi.com/airlines/64/IB.png", booking: "https://www.iberia.com" },
  AZ: { name: "ITA Airways", logo: "https://images.kiwi.com/airlines/64/AZ.png", booking: "https://www.ita-airways.com" },
  LX: { name: "Swiss", logo: "https://images.kiwi.com/airlines/64/LX.png", booking: "https://www.swiss.com" },
  OS: { name: "Austrian Airlines", logo: "https://images.kiwi.com/airlines/64/OS.png", booking: "https://www.austrian.com" },
  SN: { name: "Brussels Airlines", logo: "https://images.kiwi.com/airlines/64/SN.png", booking: "https://www.brusselsairlines.com" },
  TP: { name: "TAP Portugal", logo: "https://images.kiwi.com/airlines/64/TP.png", booking: "https://www.flytap.com" },
  AY: { name: "Finnair", logo: "https://images.kiwi.com/airlines/64/AY.png", booking: "https://www.finnair.com" },
  SK: { name: "SAS", logo: "https://images.kiwi.com/airlines/64/SK.png", booking: "https://www.flysas.com" },
  
  // Compagnies asiatiques
  NH: { name: "ANA", logo: "https://images.kiwi.com/airlines/64/NH.png", booking: "https://www.ana.co.jp" },
  JL: { name: "Japan Airlines", logo: "https://images.kiwi.com/airlines/64/JL.png", booking: "https://www.jal.co.jp" },
  SQ: { name: "Singapore Airlines", logo: "https://images.kiwi.com/airlines/64/SQ.png", booking: "https://www.singaporeair.com" },
  CX: { name: "Cathay Pacific", logo: "https://images.kiwi.com/airlines/64/CX.png", booking: "https://www.cathaypacific.com" },
  KE: { name: "Korean Air", logo: "https://images.kiwi.com/airlines/64/KE.png", booking: "https://www.koreanair.com" },
  OZ: { name: "Asiana", logo: "https://images.kiwi.com/airlines/64/OZ.png", booking: "https://flyasiana.com" },
  BR: { name: "EVA Air", logo: "https://images.kiwi.com/airlines/64/BR.png", booking: "https://www.evaair.com" },
  CI: { name: "China Airlines", logo: "https://images.kiwi.com/airlines/64/CI.png", booking: "https://www.china-airlines.com" },
  TG: { name: "Thai Airways", logo: "https://images.kiwi.com/airlines/64/TG.png", booking: "https://www.thaiairways.com" },
  MH: { name: "Malaysia Airlines", logo: "https://images.kiwi.com/airlines/64/MH.png", booking: "https://www.malaysiaairlines.com" },
  AI: { name: "Air India", logo: "https://images.kiwi.com/airlines/64/AI.png", booking: "https://www.airindia.com" },
  VN: { name: "Vietnam Airlines", logo: "https://images.kiwi.com/airlines/64/VN.png", booking: "https://www.vietnamairlines.com" },
  
  // Compagnies chinoises
  CA: { name: "Air China", logo: "https://images.kiwi.com/airlines/64/CA.png", booking: "https://www.airchina.com" },
  CZ: { name: "China Southern", logo: "https://images.kiwi.com/airlines/64/CZ.png", booking: "https://www.csair.com" },
  MU: { name: "China Eastern", logo: "https://images.kiwi.com/airlines/64/MU.png", booking: "https://www.ceair.com" },
  HU: { name: "Hainan Airlines", logo: "https://images.kiwi.com/airlines/64/HU.png", booking: "https://www.hainanairlines.com" },
  
  // Compagnies moyen-orientales
  QR: { name: "Qatar Airways", logo: "https://images.kiwi.com/airlines/64/QR.png", booking: "https://www.qatarairways.com" },
  EK: { name: "Emirates", logo: "https://images.kiwi.com/airlines/64/EK.png", booking: "https://www.emirates.com" },
  EY: { name: "Etihad", logo: "https://images.kiwi.com/airlines/64/EY.png", booking: "https://www.etihad.com" },
  TK: { name: "Turkish Airlines", logo: "https://images.kiwi.com/airlines/64/TK.png", booking: "https://www.turkishairlines.com" },
  MS: { name: "EgyptAir", logo: "https://images.kiwi.com/airlines/64/MS.png", booking: "https://www.egyptair.com" },
  
  // Compagnies américaines
  AA: { name: "American Airlines", logo: "https://images.kiwi.com/airlines/64/AA.png", booking: "https://www.aa.com" },
  UA: { name: "United Airlines", logo: "https://images.kiwi.com/airlines/64/UA.png", booking: "https://www.united.com" },
  DL: { name: "Delta Air Lines", logo: "https://images.kiwi.com/airlines/64/DL.png", booking: "https://www.delta.com" },
  AC: { name: "Air Canada", logo: "https://images.kiwi.com/airlines/64/AC.png", booking: "https://www.aircanada.com" },
  
  // Low-cost européennes
  FR: { name: "Ryanair", logo: "https://images.kiwi.com/airlines/64/FR.png", booking: "https://www.ryanair.com" },
  U2: { name: "easyJet", logo: "https://images.kiwi.com/airlines/64/U2.png", booking: "https://www.easyjet.com" },
  VY: { name: "Vueling", logo: "https://images.kiwi.com/airlines/64/VY.png", booking: "https://www.vueling.com" },
  W6: { name: "Wizz Air", logo: "https://images.kiwi.com/airlines/64/W6.png", booking: "https://wizzair.com" },
  
  // Autres compagnies importantes
  QF: { name: "Qantas", logo: "https://images.kiwi.com/airlines/64/QF.png", booking: "https://www.qantas.com" },
  NZ: { name: "Air New Zealand", logo: "https://images.kiwi.com/airlines/64/NZ.png", booking: "https://www.airnewzealand.com" },
  SA: { name: "South African Airways", logo: "https://images.kiwi.com/airlines/64/SA.png", booking: "https://www.flysaa.com" },
  ET: { name: "Ethiopian Airlines", logo: "https://images.kiwi.com/airlines/64/ET.png", booking: "https://www.ethiopianairlines.com" },
};

/**
 * Récupérer les infos d'une compagnie aérienne
 */
export const getAirlineInfo = (code) => {
  if (!code) return { name: "Unknown", logo: null, booking: null };
  
  return airlines[code] || { 
    name: code, 
    logo: `https://images.kiwi.com/airlines/64/${code}.png`,
    booking: null 
  };
};

/**
 * Générer le lien de réservation
 */
export const generateBookingLink = (flight, searchParams = {}) => {
  const carrier = flight.validatingAirlineCodes?.[0] || flight.outbound?.airline;
  const airlineInfo = getAirlineInfo(carrier);
  
  // Rediriger vers le site de la compagnie si disponible
  if (airlineInfo.booking) {
    return airlineInfo.booking;
  }
  
  // Fallback vers Google Flights uniquement si pas d'URL de compagnie
  const { origin, destination, departureDate } = searchParams;
  if (origin && destination && departureDate) {
    return `https://www.google.com/travel/flights?q=${origin}%20to%20${destination}%20${departureDate}`;
  }
  
  return "https://www.google.com/travel/flights";
};
