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
} from "lucide-react";
import { searchFlights } from "../utils/api";
import PricePredictionCard from "../components/PricePredictionCard";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("aiScore");

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

  // Tri des vols
  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case "aiScore":
        return (b.aiScore || 0) - (a.aiScore || 0);
      case "price":
        return a.price.total - b.price.total;
      case "duration":
        return (
          parseDuration(a.outbound.duration) -
          parseDuration(b.outbound.duration)
        );
      default:
        return 0;
    }
  });

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

  const displayFlights = sortedFlights.length > 0 ? sortedFlights : mockFlights;

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
                🧠 IA activée : {sortedFlights.length} vols analysés et notés
                selon vos préférences
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres avec IA Insights */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Filtres IA</h3>
              </div>

              {/* Tri par score IA */}
              <div>
                <label className="label">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-full"
                >
                  <option value="aiScore">🧠 Meilleur score IA</option>
                  <option value="price">💰 Prix le plus bas</option>
                  <option value="duration">⚡ Vol le plus rapide</option>
                </select>
              </div>

              {/* Stats IA */}
              {sortedFlights.length > 0 && (
                <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-4 w-4 text-primary-600" />
                    <span className="font-semibold text-sm">Analyse IA</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix moyen:</span>
                      <span className="font-bold">
                        {Math.round(
                          sortedFlights.reduce(
                            (sum, f) => sum + f.price.total,
                            0
                          ) / sortedFlights.length
                        )}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meilleur score:</span>
                      <span className="font-bold text-green-600">
                        {Math.max(...sortedFlights.map((f) => f.aiScore || 0))}
                        /100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vols directs:</span>
                      <span className="font-bold">
                        {
                          sortedFlights.filter((f) => f.outbound.stops === 0)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prédiction de prix IA */}
              <div>
                <PricePredictionCard
                  origin={originCode}
                  destination={destinationCode}
                  departureDate={departureDate}
                  cabinClass={cabinClass}
                />
              </div>

              {/* Prix */}
              <div>
                <label className="label">Prix maximum</label>
                <input type="range" min="0" max="1000" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0€</span>
                  <span>1000€</span>
                </div>
              </div>

              {/* Escales */}
              <div>
                <label className="label">Escales</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Direct</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">1 escale</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">2+ escales</span>
                  </label>
                </div>
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
              {sortedFlights.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <span>Triés par IA</span>
                </div>
              )}
            </div>

            {displayFlights.map((flight, index) => {
              const carrier =
                flight.carrierIds?.[0] ||
                flight.validatingAirlineCodes?.[0] ||
                flight.airline ||
                "N/A";
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
                            <div className="text-3xl">
                              {flight.logo || "✈️"}
                            </div>
                            <div>
                              <div className="font-semibold text-lg">
                                {carrier}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {flight.class || cabinClass}
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
                        <button className="btn btn-primary whitespace-nowrap">
                          Sélectionner
                        </button>
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
