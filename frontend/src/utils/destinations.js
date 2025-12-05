// Liste centralisée des destinations disponibles dans l'application
// Utilisée par LandingPage, Globe3D et HomePage pour garantir la cohérence

export const DESTINATIONS = [
  // Europe
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, code: 'CDG' },
  { city: 'London', country: 'Royaume-Uni', lat: 51.5074, lon: -0.1278, code: 'LHR' },
  { city: 'Rome', country: 'Italie', lat: 41.9028, lon: 12.4964, code: 'FCO' },
  { city: 'Madrid', country: 'Espagne', lat: 40.4168, lon: -3.7038, code: 'MAD' },
  { city: 'Berlin', country: 'Allemagne', lat: 52.5200, lon: 13.4050, code: 'TXL' },
  { city: 'Amsterdam', country: 'Pays-Bas', lat: 52.3676, lon: 4.9041, code: 'AMS' },
  { city: 'Athens', country: 'Grèce', lat: 37.9838, lon: 23.7275, code: 'ATH' },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393, code: 'LIS' },
  { city: 'Geneva', country: 'Suisse', lat: 46.2044, lon: 6.1432, code: 'GVA' },
  { city: 'Vienna', country: 'Autriche', lat: 48.2082, lon: 16.3738, code: 'VIE' },
  { city: 'Brussels', country: 'Belgique', lat: 50.8503, lon: 4.3517, code: 'BRU' },
  { city: 'Prague', country: 'République Tchèque', lat: 50.0755, lon: 14.4378, code: 'PRG' },
  { city: 'Warsaw', country: 'Pologne', lat: 52.2297, lon: 21.0122, code: 'WAW' },
  { city: 'Budapest', country: 'Hongrie', lat: 47.4979, lon: 19.0402, code: 'BUD' },
  { city: 'Stockholm', country: 'Suède', lat: 59.3293, lon: 18.0686, code: 'ARN' },
  { city: 'Oslo', country: 'Norvège', lat: 59.9139, lon: 10.7522, code: 'OSL' },
  { city: 'Copenhagen', country: 'Danemark', lat: 55.6761, lon: 12.5683, code: 'CPH' },
  { city: 'Dublin', country: 'Irlande', lat: 53.3498, lon: -6.2603, code: 'DUB' },
  { city: 'Zagreb', country: 'Croatie', lat: 45.8150, lon: 15.9819, code: 'ZAG' },
  { city: 'Istanbul', country: 'Turquie', lat: 41.0082, lon: 28.9784, code: 'IST' },
  
  // Amérique du Nord
  { city: 'New York', country: 'États-Unis', lat: 40.7128, lon: -74.0060, code: 'JFK' },
  { city: 'Los Angeles', country: 'États-Unis', lat: 34.0522, lon: -118.2437, code: 'LAX' },
  { city: 'Miami', country: 'États-Unis', lat: 25.7617, lon: -80.1918, code: 'MIA' },
  { city: 'San Francisco', country: 'États-Unis', lat: 37.7749, lon: -122.4194, code: 'SFO' },
  { city: 'Chicago', country: 'États-Unis', lat: 41.8781, lon: -87.6298, code: 'ORD' },
  { city: 'Las Vegas', country: 'États-Unis', lat: 36.1699, lon: -115.1398, code: 'LAS' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, code: 'YYZ' },
  { city: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, code: 'YUL' },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, code: 'YVR' },
  { city: 'Mexico City', country: 'Mexique', lat: 19.4326, lon: -99.1332, code: 'MEX' },
  { city: 'Cancun', country: 'Mexique', lat: 21.1619, lon: -86.8515, code: 'CUN' },
  
  // Amérique du Sud
  { city: 'Rio de Janeiro', country: 'Brésil', lat: -22.9068, lon: -43.1729, code: 'GIG' },
  { city: 'São Paulo', country: 'Brésil', lat: -23.5505, lon: -46.6333, code: 'GRU' },
  { city: 'Buenos Aires', country: 'Argentine', lat: -34.6037, lon: -58.3816, code: 'EZE' },
  { city: 'Lima', country: 'Pérou', lat: -12.0464, lon: -77.0428, code: 'LIM' },
  { city: 'Bogota', country: 'Colombie', lat: 4.7110, lon: -74.0721, code: 'BOG' },
  { city: 'Santiago', country: 'Chili', lat: -33.4489, lon: -70.6693, code: 'SCL' },
  
  // Asie
  { city: 'Tokyo', country: 'Japon', lat: 35.6762, lon: 139.6503, code: 'HND' },
  { city: 'Osaka', country: 'Japon', lat: 34.6937, lon: 135.5023, code: 'KIX' },
  { city: 'Kyoto', country: 'Japon', lat: 35.0116, lon: 135.7681, code: 'KIX' },
  { city: 'Beijing', country: 'Chine', lat: 39.9042, lon: 116.4074, code: 'PEK' },
  { city: 'Shanghai', country: 'Chine', lat: 31.2304, lon: 121.4737, code: 'PVG' },
  { city: 'Hong Kong', country: 'Chine', lat: 22.3193, lon: 114.1694, code: 'HKG' },
  { city: 'Seoul', country: 'Corée du Sud', lat: 37.5665, lon: 126.9780, code: 'ICN' },
  { city: 'Bangkok', country: 'Thaïlande', lat: 13.7563, lon: 100.5018, code: 'BKK' },
  { city: 'Phuket', country: 'Thaïlande', lat: 7.8804, lon: 98.3923, code: 'HKT' },
  { city: 'Singapore', country: 'Singapour', lat: 1.3521, lon: 103.8198, code: 'SIN' },
  { city: 'Kuala Lumpur', country: 'Malaisie', lat: 3.1390, lon: 101.6869, code: 'KUL' },
  { city: 'Jakarta', country: 'Indonésie', lat: -6.2088, lon: 106.8456, code: 'CGK' },
  { city: 'Bali', country: 'Indonésie', lat: -8.4095, lon: 115.1889, code: 'DPS' },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, code: 'HAN' },
  { city: 'Delhi', country: 'Inde', lat: 28.6139, lon: 77.2090, code: 'DEL' },
  { city: 'Mumbai', country: 'Inde', lat: 19.0760, lon: 72.8777, code: 'BOM' },
  { city: 'Dubai', country: 'Émirats Arabes Unis', lat: 25.2048, lon: 55.2708, code: 'DXB' },
  { city: 'Abu Dhabi', country: 'Émirats Arabes Unis', lat: 24.4539, lon: 54.3773, code: 'AUH' },
  { city: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, code: 'DOH' },
  { city: 'Tel Aviv', country: 'Israël', lat: 32.0853, lon: 34.7818, code: 'TLV' },
  
  // Océanie
  { city: 'Sydney', country: 'Australie', lat: -33.8688, lon: 151.2093, code: 'SYD' },
  { city: 'Melbourne', country: 'Australie', lat: -37.8136, lon: 144.9631, code: 'MEL' },
  { city: 'Brisbane', country: 'Australie', lat: -27.4698, lon: 153.0251, code: 'BNE' },
  { city: 'Auckland', country: 'Nouvelle-Zélande', lat: -36.8485, lon: 174.7633, code: 'AKL' },
  { city: 'Wellington', country: 'Nouvelle-Zélande', lat: -41.2865, lon: 174.7762, code: 'WLG' },
  
  // Afrique
  { city: 'Casablanca', country: 'Maroc', lat: 33.9716, lon: -6.8498, code: 'CMN' },
  { city: 'Marrakech', country: 'Maroc', lat: 31.6295, lon: -7.9811, code: 'RAK' },
  { city: 'Cairo', country: 'Égypte', lat: 30.0444, lon: 31.2357, code: 'CAI' },
  { city: 'Cape Town', country: 'Afrique du Sud', lat: -33.9249, lon: 18.4241, code: 'CPT' },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, code: 'NBO' },
  { city: 'Tunis', country: 'Tunisie', lat: 36.8065, lon: 10.1815, code: 'TUN' },
  
  // Destinations européennes supplémentaires
  { city: 'Barcelona', country: 'Espagne', lat: 41.3851, lon: 2.1734, code: 'BCN' },
  { city: 'Munich', country: 'Allemagne', lat: 48.1351, lon: 11.5820, code: 'MUC' },
  { city: 'Frankfurt', country: 'Allemagne', lat: 50.1109, lon: 8.6821, code: 'FRA' },
  { city: 'Milan', country: 'Italie', lat: 45.4642, lon: 9.1900, code: 'MXP' },
  { city: 'Venice', country: 'Italie', lat: 45.4408, lon: 12.3155, code: 'VCE' },
  { city: 'Florence', country: 'Italie', lat: 43.7696, lon: 11.2558, code: 'FLR' },
  { city: 'Naples', country: 'Italie', lat: 40.8518, lon: 14.2681, code: 'NAP' },
  { city: 'Porto', country: 'Portugal', lat: 41.1579, lon: -8.6291, code: 'OPO' },
  { city: 'Zurich', country: 'Suisse', lat: 47.3769, lon: 8.5417, code: 'ZRH' },
  { city: 'Nice', country: 'France', lat: 43.7102, lon: 7.2620, code: 'NCE' },
  { city: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357, code: 'LYS' },
  { city: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698, code: 'MRS' },
  { city: 'Edinburgh', country: 'Royaume-Uni', lat: 55.9533, lon: -3.1883, code: 'EDI' },
  { city: 'Manchester', country: 'Royaume-Uni', lat: 53.4808, lon: -2.2426, code: 'MAN' },
  { city: 'Helsinki', country: 'Finlande', lat: 60.1699, lon: 24.9384, code: 'HEL' },
  { city: 'Reykjavik', country: 'Islande', lat: 64.1466, lon: -21.9426, code: 'KEF' },
  { city: 'Tallinn', country: 'Estonie', lat: 59.4370, lon: 24.7536, code: 'TLL' },
  { city: 'Riga', country: 'Lettonie', lat: 56.9496, lon: 24.1052, code: 'RIX' },
  { city: 'Vilnius', country: 'Lituanie', lat: 54.6872, lon: 25.2797, code: 'VNO' },
  
  // Amérique du Nord supplémentaire
  { city: 'Seattle', country: 'États-Unis', lat: 47.6062, lon: -122.3321, code: 'SEA' },
  { city: 'Boston', country: 'États-Unis', lat: 42.3601, lon: -71.0589, code: 'BOS' },
  { city: 'Washington DC', country: 'États-Unis', lat: 38.9072, lon: -77.0369, code: 'DCA' },
  { city: 'Denver', country: 'États-Unis', lat: 39.7392, lon: -104.9903, code: 'DEN' },
  { city: 'Austin', country: 'États-Unis', lat: 30.2672, lon: -97.7431, code: 'AUS' },
  { city: 'Philadelphia', country: 'États-Unis', lat: 39.9526, lon: -75.1652, code: 'PHL' },
  { city: 'Phoenix', country: 'États-Unis', lat: 33.4484, lon: -112.0740, code: 'PHX' },
  { city: 'San Diego', country: 'États-Unis', lat: 32.7157, lon: -117.1611, code: 'SAN' },
  { city: 'Portland', country: 'États-Unis', lat: 45.5152, lon: -122.6784, code: 'PDX' },
  { city: 'New Orleans', country: 'États-Unis', lat: 29.9511, lon: -90.0715, code: 'MSY' },
  { city: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719, code: 'YYC' },
  { city: 'Quebec', country: 'Canada', lat: 46.8139, lon: -71.2080, code: 'YQB' },
  { city: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972, code: 'YOW' },
  
  // Amérique Centrale et Caraïbes
  { city: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666, code: 'HAV' },
  { city: 'San Jose', country: 'Costa Rica', lat: 9.9281, lon: -84.0907, code: 'SJO' },
  { city: 'Panama City', country: 'Panama', lat: 8.9824, lon: -79.5199, code: 'PTY' },
  { city: 'Punta Cana', country: 'République Dominicaine', lat: 18.5601, lon: -68.3725, code: 'PUJ' },
  { city: 'Kingston', country: 'Jamaïque', lat: 17.9714, lon: -76.7931, code: 'KIN' },
  
  // Amérique du Sud supplémentaire
  { city: 'Cartagena', country: 'Colombie', lat: 10.3910, lon: -75.4794, code: 'CTG' },
  { city: 'Medellin', country: 'Colombie', lat: 6.2476, lon: -75.5658, code: 'MDE' },
  { city: 'Quito', country: 'Équateur', lat: -0.1807, lon: -78.4678, code: 'UIO' },
  { city: 'Cusco', country: 'Pérou', lat: -13.5319, lon: -71.9675, code: 'CUZ' },
  { city: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645, code: 'MVD' },
  { city: 'Asuncion', country: 'Paraguay', lat: -25.2637, lon: -57.5759, code: 'ASU' },
  
  // Asie supplémentaire
  { city: 'Sapporo', country: 'Japon', lat: 43.0642, lon: 141.3469, code: 'CTS' },
  { city: 'Fukuoka', country: 'Japon', lat: 33.5904, lon: 130.4017, code: 'FUK' },
  { city: 'Chiang Mai', country: 'Thaïlande', lat: 18.7883, lon: 98.9853, code: 'CNX' },
  { city: 'Taipei', country: 'Taïwan', lat: 25.0330, lon: 121.5654, code: 'TPE' },
  { city: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, code: 'MNL' },
  { city: 'Cebu', country: 'Philippines', lat: 10.3157, lon: 123.8854, code: 'CEB' },
  { city: 'Ho Chi Minh', country: 'Vietnam', lat: 10.8231, lon: 106.6297, code: 'SGN' },
  { city: 'Phnom Penh', country: 'Cambodge', lat: 11.5564, lon: 104.9282, code: 'PNH' },
  { city: 'Yangon', country: 'Myanmar', lat: 16.8661, lon: 96.1951, code: 'RGN' },
  { city: 'Kathmandu', country: 'Népal', lat: 27.7172, lon: 85.3240, code: 'KTM' },
  { city: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, code: 'CMB' },
  { city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, code: 'DAC' },
  { city: 'Bangalore', country: 'Inde', lat: 12.9716, lon: 77.5946, code: 'BLR' },
  { city: 'Chennai', country: 'Inde', lat: 13.0827, lon: 80.2707, code: 'MAA' },
  { city: 'Hyderabad', country: 'Inde', lat: 17.3850, lon: 78.4867, code: 'HYD' },
  { city: 'Kolkata', country: 'Inde', lat: 22.5726, lon: 88.3639, code: 'CCU' },
  { city: 'Muscat', country: 'Oman', lat: 23.5880, lon: 58.3829, code: 'MCT' },
  { city: 'Amman', country: 'Jordanie', lat: 31.9454, lon: 35.9284, code: 'AMM' },
  { city: 'Beirut', country: 'Liban', lat: 33.8886, lon: 35.4955, code: 'BEY' },
  { city: 'Riyadh', country: 'Arabie Saoudite', lat: 24.7136, lon: 46.6753, code: 'RUH' },
  { city: 'Jeddah', country: 'Arabie Saoudite', lat: 21.5433, lon: 39.1728, code: 'JED' },
  
  // Océanie supplémentaire
  { city: 'Perth', country: 'Australie', lat: -31.9505, lon: 115.8605, code: 'PER' },
  { city: 'Gold Coast', country: 'Australie', lat: -28.0167, lon: 153.4000, code: 'OOL' },
  { city: 'Cairns', country: 'Australie', lat: -16.9186, lon: 145.7781, code: 'CNS' },
  { city: 'Adelaide', country: 'Australie', lat: -34.9285, lon: 138.6007, code: 'ADL' },
  { city: 'Christchurch', country: 'Nouvelle-Zélande', lat: -43.5321, lon: 172.6362, code: 'CHC' },
  { city: 'Queenstown', country: 'Nouvelle-Zélande', lat: -45.0312, lon: 168.6626, code: 'ZQN' },
  { city: 'Fiji', country: 'Fidji', lat: -17.7134, lon: 178.0650, code: 'NAN' },
  
  // Afrique supplémentaire
  { city: 'Johannesburg', country: 'Afrique du Sud', lat: -26.2041, lon: 28.0473, code: 'JNB' },
  { city: 'Durban', country: 'Afrique du Sud', lat: -29.8587, lon: 31.0218, code: 'DUR' },
  { city: 'Accra', country: 'Ghana', lat: 5.6037, lon: -0.1870, code: 'ACC' },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, code: 'LOS' },
  { city: 'Addis Ababa', country: 'Éthiopie', lat: 9.0320, lon: 38.7469, code: 'ADD' },
  { city: 'Dar es Salaam', country: 'Tanzanie', lat: -6.7924, lon: 39.2083, code: 'DAR' },
  { city: 'Zanzibar', country: 'Tanzanie', lat: -6.1659, lon: 39.2026, code: 'ZNZ' },
  { city: 'Dakar', country: 'Sénégal', lat: 14.6928, lon: -17.4467, code: 'DSS' },
  { city: 'Algiers', country: 'Algérie', lat: 36.7538, lon: 3.0588, code: 'ALG' },
  { city: 'Tangier', country: 'Maroc', lat: 35.7595, lon: -5.8340, code: 'TNG' },
  { city: 'Fes', country: 'Maroc', lat: 34.0181, lon: -5.0078, code: 'FEZ' },
  { city: 'Luxor', country: 'Égypte', lat: 25.6872, lon: 32.6396, code: 'LXR' },
  { city: 'Sharm El Sheikh', country: 'Égypte', lat: 27.9158, lon: 34.3300, code: 'SSH' },
];

// Extraire juste les noms de villes pour l'autocomplétion
export const CITY_NAMES = DESTINATIONS.map(d => d.city);

// Fonction helper pour trouver une destination par nom de ville
export const findDestinationByCity = (cityName) => {
  return DESTINATIONS.find(d => 
    d.city.toLowerCase() === cityName.toLowerCase()
  );
};
