import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plane,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Brain,
  Zap,
  Award,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { searchFlights } from "../utils/api";
import { getAirlineInfo, generateBookingLink } from "../utils/airlines";
import PricePredictionCard from "../components/PricePredictionCard";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best"); // best | price | duration
  const [maxBudget, setMaxBudget] = useState(10000);
  const [minBudget, setMinBudget] = useState(0);
  const [selectedAirlines, setSelectedAirlines] = useState([]); // Filtre par compagnies
  const [selectedStops, setSelectedStops] = useState([]); // Filtre par nombre d'escales [0, 1, 2]

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const returnDate = searchParams.get("returnDate");
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const cabinClass = searchParams.get("class") || "economy";

  // Normalise les entrées pour obtenir des codes IATA (ex: "Paris (CDG)" -> "CDG")
  const extractIata = (val) => {
    if (!val) return "";
    const paren = val.match(/\(([A-Za-z]{3})\)/);
    if (paren) return paren[1].toUpperCase();
    const direct = val.trim();
    if (/^[A-Za-z]{3}$/.test(direct)) return direct.toUpperCase();
    const any = val.match(/[A-Za-z]{3}/);
    return any ? any[0].toUpperCase() : val;
  };
  const originCode = extractIata(origin);
  const destinationCode = extractIata(destination);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const data = await searchFlights({
          origin: originCode,
          destination: destinationCode,
          departureDate,
          returnDate,
          adults: passengers,
          cabinClass,
        });
        setFlights(data.flights || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching flights:", err);
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination && departureDate) {
      fetchFlights();
    }
  }, [origin, destination, departureDate, returnDate, passengers, cabinClass]);

  // Helper pour parser la durée ISO (PT8H30M)
  const parseDuration = (duration) => {
    if (!duration) return 0;
    const hours = duration.match(/(\d+)H/)?.[1] || 0;
    const minutes = duration.match(/(\d+)M/)?.[1] || 0;
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  // Helper pour formater la durée
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const totalMinutes = parseDuration(duration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  };

  // Filtrer par compagnies, escales et prix
  const filteredFlights = flights.filter((f) => {
    // Filtre par compagnie
    if (selectedAirlines.length > 0) {
      const carrier = f.validatingAirlineCodes?.[0] || f.outbound?.airline;
      if (!selectedAirlines.includes(carrier)) return false;
    }
    
    // Filtre par nombre d'escales
    if (selectedStops.length > 0) {
      const stops = f.outbound?.stops ?? 0;
      if (!selectedStops.includes(stops)) return false;
    }
    
    // Filtre par plage de prix
    const totalPrice = Number(f.price?.total ?? f.price ?? 0);
    if (Number.isFinite(totalPrice) && (totalPrice < minBudget || totalPrice > maxBudget)) return false;
    
    return true;
  });

  // Tri des vols
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case "best": {
        // Meilleur rapport qualité/prix (durée courte + prix bas)
        const priceA = Number(a.price?.total ?? a.price ?? 0);
        const priceB = Number(b.price?.total ?? b.price ?? 0);
        const durationA = parseDuration(a.outbound?.duration);
        const durationB = parseDuration(b.outbound?.duration);
        
        // Normaliser et combiner (60% prix, 40% durée)
        const scoreA = (priceA / 1000) * 0.6 + (durationA / 60) * 0.4;
        const scoreB = (priceB / 1000) * 0.6 + (durationB / 60) * 0.4;
        
        return scoreA - scoreB;
      }
      case "price": {
        const priceA = Number(a.price?.total ?? a.price ?? 0);
        const priceB = Number(b.price?.total ?? b.price ?? 0);
        return priceA - priceB;
      }
      case "duration":
        return (
          parseDuration(a.outbound?.duration) -
          parseDuration(b.outbound?.duration)
        );
      default:
        return 0;
    }
  });

  const hasBackendFlights = sortedFlights.length > 0;

  // Extraire les compagnies disponibles pour le filtre
  const availableAirlines = Array.from(
    new Set(
      flights
        .flatMap((f) => [
          f.validatingAirlineCodes?.[0],
          f.outbound?.airline,
        ])
        .filter(Boolean)
    )
  );

  // Helper pour obtenir le badge de recommandation
  const getRecommendationBadge = (level) => {
    const badges = {
      excellent: {
        color: "bg-green-100 text-green-800",
        icon: "🏆",
        label: "Excellent choix",
      },
      good: {
        color: "bg-blue-100 text-blue-800",
        icon: "👍",
        label: "Bon choix",
      },
      acceptable: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "👌",
        label: "Acceptable",
      },
      poor: {
        color: "bg-orange-100 text-orange-800",
        icon: "⚠️",
        label: "Peu recommandé",
      },
    };
    return badges[level] || badges.acceptable;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            🧠 L'IA analyse les meilleurs vols pour vous...
          </p>
          <p className="text-gray-500 mt-2">
            Comparaison en cours sur 500+ compagnies
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">
            Erreur de recherche
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full mt-4"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Données de démonstration (fallback si pas de vraies données)
  const mockFlights = [
    {
      id: 1,
      airline: "Air France",
      logo: "🇫🇷",
      departure: "10:30",
      arrival: "14:45",
      duration: "8h 15m",
      stops: "Direct",
      price: 450,
      class: "Economy",
    },
    {
      id: 2,
      airline: "Lufthansa",
      logo: "🇩🇪",
      departure: "14:20",
      arrival: "18:50",
      duration: "8h 30m",
      stops: "1 escale",
      price: 380,
      class: "Economy",
    },
    {
      id: 3,
      airline: "British Airways",
      logo: "🇬🇧",
      departure: "08:15",
      arrival: "12:30",
      duration: "8h 15m",
      stops: "Direct",
      price: 520,
      class: "Economy",
    },
  ];

  // Si on a des vols du backend, on n'affiche que ceux qui passent les filtres.
  // Si aucun vol backend, on garde les mocks de démo.
  const displayFlights = hasBackendFlights ? filteredFlights : mockFlights;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de recherche avec IA */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <span>{origin || "Paris"}</span>
              <ArrowRight className="h-5 w-5" />
              <span>{destination || "New York"}</span>
            </div>
            <div className="opacity-90">
              {departureDate} {returnDate && `- ${returnDate}`}
            </div>
            <div className="opacity-90">
              {passengers || 1} passager{passengers > 1 ? "s" : ""}
            </div>
            <button className="ml-auto btn bg-white text-primary-600 hover:bg-gray-100">
              Modifier la recherche
            </button>
          </div>

          {sortedFlights.length > 0 && (
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2 backdrop-blur">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">
                {sortedFlights.length} vols trouvés pour votre recherche
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 space-y-6">
              <h3 className="text-lg font-semibold">Filtres</h3>

              {/* Tri */}
              <div>
                <label className="label">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-full"
                >
                  <option value="best">🏆 Meilleur rapport qualité/prix</option>
                  <option value="price">💰 Prix le plus bas</option>
                  <option value="duration">⚡ Vol le plus rapide</option>
                </select>
              </div>

              {/* Compagnies */}
              <div>
                <label className="label">Compagnies</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableAirlines.map((code) => {
                    const info = getAirlineInfo(code);
                    return (
                      <label
                        key={code}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedAirlines.includes(code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAirlines([...selectedAirlines, code]);
                            } else {
                              setSelectedAirlines(
                                selectedAirlines.filter((c) => c !== code)
                              );
                            }
                          }}
                        />
                        <span className="text-sm">{info.name}</span>
                      </label>
                    );
                  })}
                </div>
                {selectedAirlines.length > 0 && (
                  <button
                    onClick={() => setSelectedAirlines([])}
                    className="text-xs text-primary-600 hover:underline mt-2"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Prix */}
              <div>
                <label className="label">
                  Fourchette de prix: {minBudget}€ - {maxBudget}€
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Minimum</label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Maximum</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="50"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Escales */}
              <div>
                <label className="label">Escales</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStops.includes(0)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStops([...selectedStops, 0]);
                        } else {
                          setSelectedStops(selectedStops.filter((s) => s !== 0));
                        }
                      }}
                    />
                    <span className="text-sm">Direct</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStops.includes(1)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStops([...selectedStops, 1]);
                        } else {
                          setSelectedStops(selectedStops.filter((s) => s !== 1));
                        }
                      }}
                    />
                    <span className="text-sm">1 escale</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStops.includes(2)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStops([...selectedStops, 2]);
                        } else {
                          setSelectedStops(selectedStops.filter((s) => s !== 2));
                        }
                      }}
                    />
                    <span className="text-sm">2+ escales</span>
                  </label>
                </div>
                {selectedStops.length > 0 && (
                  <button
                    onClick={() => setSelectedStops([])}
                    className="text-xs text-primary-600 hover:underline mt-2"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Prédiction de prix */}
              <div>
                <PricePredictionCard
                  origin={originCode}
                  destination={destinationCode}
                  departureDate={departureDate}
                  cabinClass={cabinClass}
                />
              </div>
            </div>
          </div>

          {/* Résultats avec scoring IA */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {displayFlights.length} vol
                {displayFlights.length > 1 ? "s" : ""} trouvé
                {displayFlights.length > 1 ? "s" : ""}
              </h2>
              {hasBackendFlights && filteredFlights.length === 0 && (
                <p className="text-sm text-gray-500 ml-4">
                  Aucun vol ne correspond à vos filtres (prix/escales).
                </p>
              )}
              {sortedFlights.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <span>Triés par IA</span>
                </div>
              )}
            </div>

            {displayFlights.map((flight, index) => {
              const carrierCode =
                flight.carrierIds?.[0] ||
                flight.validatingAirlineCodes?.[0] ||
                flight.airline ||
                "AF";
              const airlineInfo = getAirlineInfo(carrierCode);
              const bookingLink = generateBookingLink(flight, {
                origin: originCode,
                destination: destinationCode,
                departureDate,
                returnDate,
              });
              const recommendation =
                flight.aiRecommendation?.level || "acceptable";
              const badge = getRecommendationBadge(recommendation);
              const highlights = flight.aiRecommendation?.highlights || [];

              return (
                <div
                  key={flight.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  {/* Badge de recommandation IA */}
                  {flight.aiScore && index < 3 && (
                    <div
                      className={`${badge.color} px-4 py-2 flex items-center justify-between text-sm font-medium`}
                    >
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>
                          {badge.icon} {badge.label}
                        </span>
                        {index === 0 && (
                          <span className="ml-2">• Top recommandation IA</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Brain className="h-4 w-4" />
                        <span className="font-bold">{flight.aiScore}/100</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Infos vol */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {airlineInfo?.logo ? (
                              <img 
                                src={airlineInfo.logo} 
                                alt={airlineInfo.name}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center text-2xl" style={{display: airlineInfo?.logo ? 'none' : 'flex'}}>
                              ✈️
                            </div>
                            <div>
                              <div className="font-semibold text-lg">
                                {airlineInfo?.name || carrierCode}
                              </div>
                              <div className="text-sm text-gray-500">
                                {airlineInfo?.code || carrierCode} •{" "}
                                <span className="capitalize">
                                  {flight.class || cabinClass}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Score IA */}
                          {flight.aiScore && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Score IA
                              </div>
                              <div className="text-2xl font-bold text-primary-600">
                                {flight.aiScore}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {flight.outbound?.departure?.time
                                ? new Date(
                                    flight.outbound.departure.time
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : flight.departure}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.outbound?.departure?.airport ||
                                origin ||
                                "PAR"}
                            </div>
                          </div>

                          <div className="flex-1 px-6">
                            <div className="flex items-center justify-center space-x-2 text-gray-600">
                              <div className="h-px bg-gray-300 flex-1"></div>
                              <Plane className="h-5 w-5" />
                              <div className="h-px bg-gray-300 flex-1"></div>
                            </div>
                            <div className="text-center mt-2">
                              <div className="text-sm font-medium">
                                {flight.outbound?.duration
                                  ? formatDuration(flight.outbound.duration)
                                  : flight.duration}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.outbound?.stops !== undefined
                                  ? flight.outbound.stops === 0
                                    ? "Direct"
                                    : `${flight.outbound.stops} escale${
                                        flight.outbound.stops > 1 ? "s" : ""
                                      }`
                                  : flight.stops}
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {flight.outbound?.arrival?.time
                                ? new Date(
                                    flight.outbound.arrival.time
                                  ).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : flight.arrival}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.outbound?.arrival?.airport ||
                                destination ||
                                "NYC"}
                            </div>
                          </div>
                        </div>

                        {/* Highlights IA */}
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {highlights.slice(0, 3).map((highlight, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {highlight}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Breakdown du score IA */}
                        {flight.scoreBreakdown && (
                          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-gray-500">💰 Prix</div>
                              <div className="font-bold text-primary-600">
                                {Math.round(flight.scoreBreakdown.price)}/100
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">⏱️ Durée</div>
                              <div className="font-bold text-primary-600">
                                {Math.round(flight.scoreBreakdown.duration)}/100
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">✨ Confort</div>
                              <div className="font-bold text-primary-600">
                                {Math.round(flight.scoreBreakdown.comfort)}/100
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prix et bouton */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-600">
                            {Math.round(flight.price?.total || flight.price)}€
                          </div>
                          <div className="text-sm text-gray-600">
                            par personne
                          </div>
                          {flight.price?.perAdult && passengers > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Total:{" "}
                              {Math.round(flight.price.total * passengers)}€
                            </div>
                          )}
                        </div>
                        <a
                          href={bookingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary whitespace-nowrap inline-flex items-center space-x-2 hover:scale-105 transition-transform"
                        >
                          <span>Sélectionner</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Message info IA */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mt-8">
              <div className="flex items-start space-x-3">
                <Brain className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-blue-900 font-medium mb-2">
                    💡 Intelligence Artificielle SMART TRIP
                  </p>
                  <p className="text-blue-800 text-sm">
                    Notre IA analyse en temps réel <strong>6 critères</strong>{" "}
                    (prix, confort, durée, escales, compagnie, timing) pour vous
                    recommander les meilleurs vols selon vos préférences. Les
                    vols sont triés automatiquement du plus au moins recommandé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
