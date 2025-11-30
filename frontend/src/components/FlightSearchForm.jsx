import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRightLeft,
  Plane,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Liste des aéroports populaires pour l'autocomplétion
const POPULAR_AIRPORTS = [
  // France
  {
    code: "CDG",
    city: "Paris",
    airport: "Charles de Gaulle",
    country: "France",
  },
  { code: "ORY", city: "Paris", airport: "Orly", country: "France" },
  { code: "NCE", city: "Nice", airport: "Côte d'Azur", country: "France" },
  { code: "LYS", city: "Lyon", airport: "Saint-Exupéry", country: "France" },
  { code: "MRS", city: "Marseille", airport: "Provence", country: "France" },
  { code: "TLS", city: "Toulouse", airport: "Blagnac", country: "France" },
  { code: "BOD", city: "Bordeaux", airport: "Mérignac", country: "France" },
  { code: "NTE", city: "Nantes", airport: "Atlantique", country: "France" },

  // Europe
  { code: "LHR", city: "Londres", airport: "Heathrow", country: "Royaume-Uni" },
  { code: "LGW", city: "Londres", airport: "Gatwick", country: "Royaume-Uni" },
  { code: "AMS", city: "Amsterdam", airport: "Schiphol", country: "Pays-Bas" },
  { code: "FRA", city: "Francfort", airport: "Main", country: "Allemagne" },
  {
    code: "MUC",
    city: "Munich",
    airport: "Franz Josef Strauss",
    country: "Allemagne",
  },
  { code: "BCN", city: "Barcelone", airport: "El Prat", country: "Espagne" },
  { code: "MAD", city: "Madrid", airport: "Barajas", country: "Espagne" },
  { code: "FCO", city: "Rome", airport: "Fiumicino", country: "Italie" },
  { code: "MXP", city: "Milan", airport: "Malpensa", country: "Italie" },
  { code: "VCE", city: "Venise", airport: "Marco Polo", country: "Italie" },
  { code: "ZRH", city: "Zurich", airport: "Kloten", country: "Suisse" },
  { code: "GVA", city: "Genève", airport: "Cointrin", country: "Suisse" },
  { code: "BRU", city: "Bruxelles", airport: "Zaventem", country: "Belgique" },
  { code: "VIE", city: "Vienne", airport: "Schwechat", country: "Autriche" },
  { code: "CPH", city: "Copenhague", airport: "Kastrup", country: "Danemark" },
  { code: "ARN", city: "Stockholm", airport: "Arlanda", country: "Suède" },
  { code: "OSL", city: "Oslo", airport: "Gardermoen", country: "Norvège" },
  { code: "LIS", city: "Lisbonne", airport: "Portela", country: "Portugal" },
  { code: "DUB", city: "Dublin", airport: "International", country: "Irlande" },
  {
    code: "ATH",
    city: "Athènes",
    airport: "Eleftherios Venizelos",
    country: "Grèce",
  },
  { code: "IST", city: "Istanbul", airport: "Airport", country: "Turquie" },

  // Amériques
  { code: "JFK", city: "New York", airport: "JFK", country: "États-Unis" },
  { code: "EWR", city: "New York", airport: "Newark", country: "États-Unis" },
  {
    code: "LAX",
    city: "Los Angeles",
    airport: "International",
    country: "États-Unis",
  },
  {
    code: "SFO",
    city: "San Francisco",
    airport: "International",
    country: "États-Unis",
  },
  {
    code: "MIA",
    city: "Miami",
    airport: "International",
    country: "États-Unis",
  },
  { code: "ORD", city: "Chicago", airport: "O'Hare", country: "États-Unis" },
  { code: "YUL", city: "Montréal", airport: "Trudeau", country: "Canada" },
  { code: "YYZ", city: "Toronto", airport: "Pearson", country: "Canada" },
  { code: "MEX", city: "Mexico", airport: "International", country: "Mexique" },

  // Asie
  {
    code: "DXB",
    city: "Dubaï",
    airport: "International",
    country: "Émirats Arabes Unis",
  },
  { code: "HND", city: "Tokyo", airport: "Haneda", country: "Japon" },
  { code: "NRT", city: "Tokyo", airport: "Narita", country: "Japon" },
  { code: "SIN", city: "Singapour", airport: "Changi", country: "Singapour" },
  {
    code: "HKG",
    city: "Hong Kong",
    airport: "International",
    country: "Hong Kong",
  },
  {
    code: "BKK",
    city: "Bangkok",
    airport: "Suvarnabhumi",
    country: "Thaïlande",
  },
  { code: "ICN", city: "Séoul", airport: "Incheon", country: "Corée du Sud" },
  { code: "PEK", city: "Pékin", airport: "Capital", country: "Chine" },
  { code: "PVG", city: "Shanghai", airport: "Pudong", country: "Chine" },
  { code: "DEL", city: "Delhi", airport: "Indira Gandhi", country: "Inde" },

  // Afrique
  {
    code: "CAI",
    city: "Le Caire",
    airport: "International",
    country: "Égypte",
  },
  {
    code: "JNB",
    city: "Johannesburg",
    airport: "OR Tambo",
    country: "Afrique du Sud",
  },
  { code: "CMN", city: "Casablanca", airport: "Mohammed V", country: "Maroc" },
  { code: "TUN", city: "Tunis", airport: "Carthage", country: "Tunisie" },
  {
    code: "ALG",
    city: "Alger",
    airport: "Houari Boumediene",
    country: "Algérie",
  },

  // Océanie
  {
    code: "SYD",
    city: "Sydney",
    airport: "Kingsford Smith",
    country: "Australie",
  },
  {
    code: "MEL",
    city: "Melbourne",
    airport: "Tullamarine",
    country: "Australie",
  },
  {
    code: "AKL",
    city: "Auckland",
    airport: "International",
    country: "Nouvelle-Zélande",
  },
];

export default function FlightSearchForm() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("roundtrip"); // 'roundtrip', 'oneway', 'multicity'
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    class: "economy",
    directFlightsOnly: false,
  });

  // États pour l'autocomplétion
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const originDropdownRef = useRef(null);
  const destinationDropdownRef = useRef(null);

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        originDropdownRef.current &&
        !originDropdownRef.current.contains(event.target) &&
        !originInputRef.current.contains(event.target)
      ) {
        setShowOriginSuggestions(false);
      }
      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target) &&
        !destinationInputRef.current.contains(event.target)
      ) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrer les suggestions pour l'origine
  const handleOriginChange = (value) => {
    setSearchData((prev) => ({ ...prev, origin: value }));

    if (value.length >= 2) {
      const filtered = POPULAR_AIRPORTS.filter(
        (airport) =>
          airport.city.toLowerCase().includes(value.toLowerCase()) ||
          airport.code.toLowerCase().includes(value.toLowerCase()) ||
          airport.country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setOriginSuggestions(filtered);
      setShowOriginSuggestions(true);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  // Filtrer les suggestions pour la destination
  const handleDestinationChange = (value) => {
    setSearchData((prev) => ({ ...prev, destination: value }));

    if (value.length >= 2) {
      const filtered = POPULAR_AIRPORTS.filter(
        (airport) =>
          airport.city.toLowerCase().includes(value.toLowerCase()) ||
          airport.code.toLowerCase().includes(value.toLowerCase()) ||
          airport.country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setDestinationSuggestions(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  // Sélectionner une suggestion pour l'origine
  const selectOriginSuggestion = (airport) => {
    const newValue = `${airport.city} (${airport.code})`;
    setSearchData((prev) => ({
      ...prev,
      origin: newValue,
    }));
    setShowOriginSuggestions(false);
    // Optionnel: donner le focus au champ destination
    setTimeout(() => {
      if (destinationInputRef.current) {
        destinationInputRef.current.focus();
      }
    }, 100);
  };

  // Sélectionner une suggestion pour la destination
  const selectDestinationSuggestion = (airport) => {
    const newValue = `${airport.city} (${airport.code})`;
    setSearchData((prev) => ({
      ...prev,
      destination: newValue,
    }));
    setShowDestinationSuggestions(false);
  };

  // Convertit une valeur saisie type "Paris (CDG)" en code IATA "CDG"
  const extractIata = (val) => {
    if (!val) return "";
    const paren = val.match(/\(([A-Za-z]{3})\)/);
    if (paren) return paren[1].toUpperCase();
    const direct = val.trim();
    if (/^[A-Za-z]{3}$/.test(direct)) return direct.toUpperCase();
    const any = val.match(/[A-Za-z]{3}/);
    return any ? any[0].toUpperCase() : val;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Rediriger vers la page de résultats avec les paramètres
    const params = new URLSearchParams({
      origin: extractIata(searchData.origin),
      destination: extractIata(searchData.destination),
      departureDate: searchData.departureDate,
      ...(tripType === "roundtrip" && searchData.returnDate
        ? { returnDate: searchData.returnDate }
        : {}),
      passengers: String(searchData.passengers),
      class: searchData.class,
      tripType,
      ...(searchData.directFlightsOnly ? { directFlightsOnly: 'true' } : {}),
    });
    navigate(`/search?${params.toString()}`);
  };

  const swapLocations = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 600);
    setSearchData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
      {/* Type de voyage */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setTripType("roundtrip")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === "roundtrip"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Aller-retour
        </button>
        <button
          onClick={() => setTripType("oneway")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === "oneway"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Aller simple
        </button>
        <button
          onClick={() => setTripType("multicity")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === "multicity"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Multi-destinations
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Origine et Destination avec bouton swap centré */}
        <div className="relative mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-4 items-end">
            {/* Origine */}
            <div className="space-y-2 mb-4 md:mb-0">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ville de départ
              </label>
              <div className="relative">
                <input
                  ref={originInputRef}
                  type="text"
                  placeholder="Paris (CDG)"
                  value={searchData.origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() =>
                    searchData.origin.length >= 2 &&
                    setShowOriginSuggestions(true)
                  }
                  className="input pl-10 text-gray-900"
                  required
                  autoComplete="off"
                  onBlur={() =>
                    setTimeout(() => setShowOriginSuggestions(false), 150)
                  }
                />
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchData.origin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchData((prev) => ({ ...prev, origin: "" }));
                      setShowOriginSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggestions d'origine */}
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div
                  ref={originDropdownRef}
                  className="absolute z-50 w-full md:w-[calc(50%-1rem)] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                >
                  {originSuggestions.map((airport, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectOriginSuggestion(airport)}
                      className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0 focus:bg-primary-50 focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {airport.city}
                            <span className="ml-2 text-primary-600 font-bold">
                              ({airport.code})
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.airport} - {airport.country}
                          </div>
                        </div>
                        <Plane className="h-5 w-5 text-gray-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton swap aligné avec les inputs */}
            <button
              type="button"
              onClick={swapLocations}
              className="hidden md:flex items-center justify-center bg-white border-2 border-primary-600 rounded-full p-3 text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 mb-0"
              title="Inverser départ/arrivée"
            >
              <ArrowRightLeft className={`h-5 w-5 transition-transform duration-600 ${isSwapping ? 'rotate-180' : ''}`} />
            </button>

            {/* Destination */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" />
                Destination
              </label>
              <div className="relative">
                <input
                  ref={destinationInputRef}
                  type="text"
                  placeholder="New York (JFK)"
                  value={searchData.destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() =>
                    searchData.destination.length >= 2 &&
                    setShowDestinationSuggestions(true)
                  }
                  className="input pl-10 text-gray-900"
                  required
                  autoComplete="off"
                  onBlur={() =>
                    setTimeout(() => setShowDestinationSuggestions(false), 150)
                  }
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchData.destination && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchData((prev) => ({ ...prev, destination: "" }));
                      setShowDestinationSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggestions de destination */}
              {showDestinationSuggestions &&
                destinationSuggestions.length > 0 && (
                  <div
                    ref={destinationDropdownRef}
                    className="absolute z-50 w-full md:w-[calc(50%-1rem)] right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                  >
                    {destinationSuggestions.map((airport, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectDestinationSuggestion(airport)}
                        className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0 focus:bg-primary-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {airport.city}
                              <span className="ml-2 text-primary-600 font-bold">
                                ({airport.code})
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {airport.airport} - {airport.country}
                            </div>
                          </div>
                          <MapPin className="h-5 w-5 text-gray-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date de départ */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date de départ
            </label>
            <div className="relative">
              <input
                type="date"
                value={searchData.departureDate}
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    departureDate: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="input pr-10 cursor-pointer hover:border-primary-400 transition-colors text-gray-900"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date de retour */}
          {tripType === "roundtrip" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de retour
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={searchData.returnDate}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      returnDate: e.target.value,
                    }))
                  }
                  min={
                    searchData.departureDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="input pr-10 cursor-pointer hover:border-primary-400 transition-colors text-gray-900"
                  required={tripType === "roundtrip"}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Passagers et Classe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Nombre de passagers */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Users className="inline h-4 w-4 mr-1" />
              Passagers
            </label>
            <select
              value={searchData.passengers}
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  passengers: parseInt(e.target.value),
                }))
              }
              className="input text-gray-900 font-medium cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num} className="text-gray-900">
                  {num} passager{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ✈️ Classe
            </label>
            <select
              value={searchData.class}
              onChange={(e) =>
                setSearchData((prev) => ({ ...prev, class: e.target.value }))
              }
              className="input text-gray-900 font-medium cursor-pointer"
            >
              <option value="economy" className="text-gray-900">Économique</option>
              <option value="premium" className="text-gray-900">Premium Économique</option>
              <option value="business" className="text-gray-900">Affaires</option>
              <option value="first" className="text-gray-900">Première Classe</option>
            </select>
          </div>
        </div>

        {/* Bouton de recherche */}
        <button
          type="submit"
          className="w-full btn btn-primary text-lg py-4 flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Rechercher des vols</span>
        </button>

        {/* Options supplémentaires */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchData.directFlightsOnly}
              onChange={(e) =>
                setSearchData((prev) => ({
                  ...prev,
                  directFlightsOnly: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">Vols directs uniquement</span>
          </label>
        </div>
      </form>
    </div>
  );
}
