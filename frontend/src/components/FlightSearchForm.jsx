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
import { DESTINATIONS } from '../utils/destinations';

// Convertir les destinations en format aéroport pour la compatibilité
const POPULAR_AIRPORTS = DESTINATIONS.map(dest => ({
  code: dest.code,
  city: dest.city,
  airport: "International",
  country: dest.country
}));

export default function FlightSearchForm({ initialDestination = null }) {
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

  // État pour multi-city (segments de vol)
  const [multiCitySegments, setMultiCitySegments] = useState([
    { origin: "", destination: "", departureDate: "" },
    { origin: "", destination: "", departureDate: "" },
  ]);

  // États pour l'autocomplétion des segments multi-city
  const [segmentSuggestions, setSegmentSuggestions] = useState({});
  const [showSegmentSuggestions, setShowSegmentSuggestions] = useState({});

  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const originDropdownRef = useRef(null);
  const destinationDropdownRef = useRef(null);

  // Initialiser la destination si fournie depuis le globe
  useEffect(() => {
    if (initialDestination) {
      // Chercher l'aéroport correspondant à la ville
      const airport = POPULAR_AIRPORTS.find(
        (a) => a.city.toLowerCase() === initialDestination.toLowerCase()
      );
      if (airport) {
        setSearchData((prev) => ({
          ...prev,
          destination: `${airport.city} (${airport.code})`,
        }));
      } else {
        // Si pas trouvé exactement, chercher une correspondance partielle
        const partialMatch = POPULAR_AIRPORTS.find((a) =>
          a.city.toLowerCase().includes(initialDestination.toLowerCase())
        );
        if (partialMatch) {
          setSearchData((prev) => ({
            ...prev,
            destination: `${partialMatch.city} (${partialMatch.code})`,
          }));
        }
      }
    }
  }, [initialDestination]);

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
    
    if (tripType === "multicity") {
      // Pour multi-city, envoyer les segments
      console.log("Multi-city segments:", multiCitySegments);
      const params = new URLSearchParams({
        tripType: "multicity",
        segments: JSON.stringify(multiCitySegments.map(seg => ({
          origin: extractIata(seg.origin),
          destination: extractIata(seg.destination),
          departureDate: seg.departureDate,
        }))),
        passengers: String(searchData.passengers),
        class: searchData.class,
      });
      navigate(`/search?${params.toString()}`);
    } else {
      // Pour aller simple et aller-retour
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
    }
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

  // Fonctions pour gérer les segments multi-city
  const addSegment = () => {
    setMultiCitySegments([...multiCitySegments, { origin: "", destination: "", departureDate: "" }]);
  };

  const removeSegment = (index) => {
    if (multiCitySegments.length > 2) {
      setMultiCitySegments(multiCitySegments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index, field, value) => {
    const newSegments = [...multiCitySegments];
    newSegments[index][field] = value;
    setMultiCitySegments(newSegments);

    // Autocomplétion pour les segments
    if ((field === 'origin' || field === 'destination') && value.length >= 2) {
      const filtered = POPULAR_AIRPORTS.filter(
        (airport) =>
          airport.city.toLowerCase().includes(value.toLowerCase()) ||
          airport.code.toLowerCase().includes(value.toLowerCase()) ||
          airport.country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      
      setSegmentSuggestions(prev => ({
        ...prev,
        [`${index}-${field}`]: filtered
      }));
      
      setShowSegmentSuggestions(prev => ({
        ...prev,
        [`${index}-${field}`]: true
      }));
    } else if (field === 'origin' || field === 'destination') {
      setShowSegmentSuggestions(prev => ({
        ...prev,
        [`${index}-${field}`]: false
      }));
    }
  };

  const selectSegmentSuggestion = (index, field, airport) => {
    const newValue = `${airport.city} (${airport.code})`;
    const newSegments = [...multiCitySegments];
    newSegments[index][field] = newValue;
    setMultiCitySegments(newSegments);
    
    setShowSegmentSuggestions(prev => ({
      ...prev,
      [`${index}-${field}`]: false
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
      {/* Type de voyage */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
        <div className="flex flex-wrap gap-4">
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

        {/* Bouton swap - version compacte en haut à droite */}
        <button
          type="button"
          onClick={swapLocations}
          className="bg-white border-2 border-primary-600 rounded-full p-2 text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
          title="Inverser départ/arrivée"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Origine et Destination avec bouton swap centré - Masqué pour multi-city */}
        {tripType !== "multicity" && (
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
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
                  >
                    {originSuggestions.map((airport, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectOrigin(airport)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex items-center gap-3"
                      >
                        <Plane className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {airport.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.iata_code} · {airport.city}, {airport.country}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

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
        )}

        {/* Interface Multi-City */}
        {tripType === "multicity" && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                ✈️ Segments de vol
              </label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Entrez les codes IATA (ex: CDG, JFK, HND)
              </span>
            </div>
            {multiCitySegments.map((segment, index) => (
              <div key={index} className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-base">Vol {index + 1}</h4>
                  {multiCitySegments.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeSegment(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      ✕ Supprimer
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Origine */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      📍 Départ
                    </label>
                    <input
                      type="text"
                      placeholder="Paris (CDG)"
                      value={segment.origin}
                      onChange={(e) => updateSegment(index, 'origin', e.target.value)}
                      onFocus={() => {
                        if (segment.origin.length >= 2) {
                          setShowSegmentSuggestions(prev => ({ ...prev, [`${index}-origin`]: true }));
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 font-medium placeholder-gray-400"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Suggestions origine */}
                    {showSegmentSuggestions[`${index}-origin`] && segmentSuggestions[`${index}-origin`]?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {segmentSuggestions[`${index}-origin`].map((airport, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSegmentSuggestion(index, 'origin', airport)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {airport.city}
                              <span className="ml-2 text-primary-600 font-bold">
                                ({airport.code})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {airport.airport} - {airport.country}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Destination */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      📍 Arrivée
                    </label>
                    <input
                      type="text"
                      placeholder="New York (JFK)"
                      value={segment.destination}
                      onChange={(e) => updateSegment(index, 'destination', e.target.value)}
                      onFocus={() => {
                        if (segment.destination.length >= 2) {
                          setShowSegmentSuggestions(prev => ({ ...prev, [`${index}-destination`]: true }));
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 font-medium placeholder-gray-400"
                      required
                      autoComplete="off"
                    />
                    
                    {/* Suggestions destination */}
                    {showSegmentSuggestions[`${index}-destination`] && segmentSuggestions[`${index}-destination`]?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {segmentSuggestions[`${index}-destination`].map((airport, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSegmentSuggestion(index, 'destination', airport)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="font-semibold text-gray-900">
                              {airport.city}
                              <span className="ml-2 text-primary-600 font-bold">
                                ({airport.code})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {airport.airport} - {airport.country}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      📅 Date de départ
                    </label>
                    <input
                      type="date"
                      value={segment.departureDate}
                      onChange={(e) => updateSegment(index, 'departureDate', e.target.value)}
                      min={
                        index === 0 
                          ? new Date().toISOString().split("T")[0]
                          : multiCitySegments[index - 1]?.departureDate || new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 font-medium cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSegment}
              className="w-full py-4 border-2 border-dashed border-primary-400 rounded-lg text-primary-600 hover:bg-primary-50 hover:border-primary-600 transition-all font-semibold text-base"
            >
              ➕ Ajouter un vol
            </button>
          </div>
        )}

        {/* Dates - Seulement pour aller simple et aller-retour */}
        {tripType !== "multicity" && (
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
        )}

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

        {/* Options supplémentaires - Seulement pour aller simple et aller-retour */}
        {tripType !== "multicity" && (
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
        )}
      </form>
    </div>
  );
}
