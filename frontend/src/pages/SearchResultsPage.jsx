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


export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best"); // best | price | duration
  const [maxBudget, setMaxBudget] = useState(10000);
  const [minBudget, setMinBudget] = useState(0);
  const [selectedAirlines, setSelectedAirlines] = useState([]); // Filtre par compagnies
  const [selectedStopsOutbound, setSelectedStopsOutbound] = useState([]); // Filtre escales aller
  const [selectedStopsInbound, setSelectedStopsInbound] = useState([]); // Filtre escales retour

  // Filtres multi-city par segment
  const [multiCityStopsFilters, setMultiCityStopsFilters] = useState({}); // { 0: [0, 1], 1: [0], ... }

  // Détecter le type de voyage
  const tripType = searchParams.get("tripType");
  const isMultiCity = tripType === "multicity";

  // Pour multi-city
  const [multiCitySegments, setMultiCitySegments] = useState([]);
  const [multiCityLoading, setMultiCityLoading] = useState(false);

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const returnDate = searchParams.get("returnDate");
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const cabinClass = searchParams.get("class") || "economy";
  const directFlightsOnly = searchParams.get("directFlightsOnly") === "true";

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
    // Gestion Multi-City
    if (isMultiCity) {
      const segmentsParam = searchParams.get("segments");
      console.log("Multi-city segments param:", segmentsParam);
      
      if (segmentsParam) {
        try {
          const parsedSegments = JSON.parse(decodeURIComponent(segmentsParam));
          console.log("Parsed segments:", parsedSegments);
          setMultiCitySegments(parsedSegments);
          
          // Lancer les recherches en parallèle pour chaque segment
          const fetchMultiCityFlights = async () => {
            setMultiCityLoading(true);
            setError(null);
            
            try {
              // Faire toutes les recherches en parallèle
              const searchPromises = parsedSegments.map((segment, index) => 
                searchFlights({
                  origin: segment.origin,
                  destination: segment.destination,
                  departureDate: segment.departureDate,
                  adults: passengers,
                  cabinClass,
                  nonStop: false,
                }).then(data => ({
                  segmentIndex: index,
                  segment,
                  flights: data.flights || []
                })).catch(err => {
                  console.error(`Error fetching flights for segment ${index + 1}:`, err);
                  return {
                    segmentIndex: index,
                    segment,
                    flights: [],
                    error: err.message
                  };
                })
              );
              
              const results = await Promise.all(searchPromises);
              console.log("Multi-city search results:", results);
              
              // Stocker les résultats dans flights (structure spéciale pour multi-city)
              setFlights(results);
              
            } catch (err) {
              console.error("Error in multi-city search:", err);
              setError("Erreur lors de la recherche multi-destinations");
            } finally {
              setMultiCityLoading(false);
            }
          };
          
          fetchMultiCityFlights();
          
        } catch (err) {
          console.error("Error parsing multi-city segments:", err);
          setError("Erreur lors du chargement des segments multi-city");
        }
      }
      return;
    }

    // Gestion normale (aller simple / aller-retour)
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
          nonStop: directFlightsOnly,
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
  }, [origin, destination, departureDate, returnDate, passengers, cabinClass, directFlightsOnly]);

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

  // Fonction pour créer des combinaisons de vols multi-city
  const createMultiCityCombinations = (segmentsData) => {
    if (!segmentsData || segmentsData.length === 0) return [];
    
    // Fonction récursive pour créer toutes les combinaisons
    const generateCombinations = (index, currentCombo) => {
      if (index === segmentsData.length) {
        return [currentCombo];
      }
      
      const segment = segmentsData[index];
      const segmentFlights = segment.flights || [];
      
      if (segmentFlights.length === 0) {
        return generateCombinations(index + 1, currentCombo);
      }
      
      const combinations = [];
      for (const flight of segmentFlights) {
        combinations.push(...generateCombinations(index + 1, [...currentCombo, { segmentIndex: index, flight }]));
      }
      
      return combinations;
    };
    
    const allCombinations = generateCombinations(0, []);
    
    // Transformer les combinaisons en objets avec prix total et durée totale
    return allCombinations.map((combo, idx) => {
      const totalPrice = combo.reduce((sum, item) => {
        const price = Number(item.flight.price?.total ?? item.flight.price ?? 0);
        return sum + price;
      }, 0);
      
      const totalDuration = combo.reduce((sum, item) => {
        return sum + parseDuration(item.flight.outbound?.duration);
      }, 0);
      
      return {
        id: `combo-${idx}`,
        segments: combo,
        totalPrice,
        totalDuration,
      };
    });
  };

  // Calculer les badges pour les combinaisons multi-city
  const getMultiCityBadges = (combinations) => {
    if (!combinations || combinations.length === 0) return {};
    
    const badges = {};
    
    // Meilleur (60% prix + 40% durée) - priorité 1
    const best = combinations.reduce((best, combo) => {
      const scoreCombo = combo.totalPrice * 0.6 + combo.totalDuration * 0.4;
      const scoreBest = best.totalPrice * 0.6 + best.totalDuration * 0.4;
      return scoreCombo < scoreBest ? combo : best;
    });
    badges[best.id] = 'MEILLEUR';
    
    // Meilleur prix - seulement si pas déjà "MEILLEUR"
    const cheapest = combinations.reduce((min, combo) => 
      combo.totalPrice < min.totalPrice ? combo : min
    );
    if (!badges[cheapest.id]) {
      badges[cheapest.id] = 'MOINS CHER';
    }
    
    // Plus rapide - seulement si pas déjà un autre badge
    const fastest = combinations.reduce((min, combo) => 
      combo.totalDuration < min.totalDuration ? combo : min
    );
    if (!badges[fastest.id]) {
      badges[fastest.id] = 'PLUS RAPIDE';
    }
    
    return badges;
  };

  // Extraire les compagnies uniques des vols trouvés
  const availableAirlines = [...new Set(
    flights.map(f => f.validatingAirlineCodes?.[0] || f.outbound?.airline).filter(Boolean)
  )];

  // Filtrer par compagnies, escales et prix
  const filteredFlights = flights.filter((f) => {
    // Filtre par compagnie
    if (selectedAirlines.length > 0) {
      const carrier = f.validatingAirlineCodes?.[0] || f.outbound?.airline;
      if (!selectedAirlines.includes(carrier)) return false;
    }
    
    // Filtre par nombre d'escales ALLER
    if (selectedStopsOutbound.length > 0) {
      const stops = f.outbound?.stops ?? 0;
      const matchesFilter = selectedStopsOutbound.some(selectedStop => {
        if (selectedStop === 2) return stops >= 2;
        return stops === selectedStop;
      });
      if (!matchesFilter) return false;
    }
    
    // Filtre par nombre d'escales RETOUR (si vol aller-retour)
    if (selectedStopsInbound.length > 0 && f.inbound) {
      const stops = f.inbound?.stops ?? 0;
      const matchesFilter = selectedStopsInbound.some(selectedStop => {
        if (selectedStop === 2) return stops >= 2;
        return stops === selectedStop;
      });
      if (!matchesFilter) return false;
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
        // Meilleur rapport qualité/prix : combine prix (60%) et durée (40%)
        const priceA = Number(a.price?.total ?? a.price ?? 0);
        const priceB = Number(b.price?.total ?? b.price ?? 0);
        const durationA = parseDuration(a.outbound?.duration);
        const durationB = parseDuration(b.outbound?.duration);
        
        // Score plus bas = meilleur (prix bas + durée courte)
        const scoreA = priceA * 0.6 + durationA * 0.4;
        const scoreB = priceB * 0.6 + durationB * 0.4;
        
        return scoreA - scoreB; // Tri ascendant
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

  // Vérifier si on a des vols de l'API (avant filtres)
  const hasBackendFlights = flights.length > 0;

  // Fonction pour déterminer les badges (meilleurs vols par catégorie)
  const getBestFlightsBadges = (flights) => {
    if (flights.length === 0) return {};
    
    const badges = {};
    
    // MOINS CHER : prix le plus bas
    const sortedByPrice = [...flights].sort((a, b) => {
      const priceA = Number(a.price?.total ?? a.price ?? 0);
      const priceB = Number(b.price?.total ?? b.price ?? 0);
      return priceA - priceB;
    });
    const cheapest = sortedByPrice[0];
    badges[cheapest.id] = { type: 'cheapest', label: 'MOINS CHER', icon: '💰', color: 'bg-green-500' };
    
    // PLUS RAPIDE : durée la plus courte
    const sortedByDuration = [...flights].sort((a, b) => {
      return parseDuration(a.outbound?.duration) - parseDuration(b.outbound?.duration);
    });
    const fastest = sortedByDuration[0];
    
    // Ajouter badge PLUS RAPIDE seulement si différent du moins cher
    if (fastest.id !== cheapest.id) {
      badges[fastest.id] = { type: 'fastest', label: 'PLUS RAPIDE', icon: '⚡', color: 'bg-blue-500' };
    }
    
    // MEILLEUR : meilleur rapport qualité/prix sur TOUS les vols
    // Normaliser les scores pour avoir une comparaison équitable
    const allPrices = flights.map(f => Number(f.price?.total ?? f.price ?? 0));
    const allDurations = flights.map(f => parseDuration(f.outbound?.duration));
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const minDuration = Math.min(...allDurations);
    const maxDuration = Math.max(...allDurations);
    
    const flightsWithScores = flights
      .filter(f => f.id !== cheapest.id && f.id !== fastest.id) // Exclure les 2 déjà badgés
      .map(f => {
        const price = Number(f.price?.total ?? f.price ?? 0);
        const duration = parseDuration(f.outbound?.duration);
        
        // Normalisation 0-100 (0 = meilleur, 100 = pire)
        const priceScore = maxPrice > minPrice ? ((price - minPrice) / (maxPrice - minPrice)) * 100 : 0;
        const durationScore = maxDuration > minDuration ? ((duration - minDuration) / (maxDuration - minDuration)) * 100 : 0;
        
        // Score combiné : 60% prix + 40% durée (score bas = meilleur)
        const totalScore = priceScore * 0.6 + durationScore * 0.4;
        
        return { ...f, totalScore };
      })
      .sort((a, b) => a.totalScore - b.totalScore);
    
    if (flightsWithScores.length > 0) {
      const best = flightsWithScores[0];
      badges[best.id] = { type: 'best', label: 'MEILLEUR', icon: '🏆', color: 'bg-purple-500' };
    }
    
    return badges;
  };
  
  const flightBadges = getBestFlightsBadges(sortedFlights);

  // Affichage spécial pour Multi-City
  if (isMultiCity) {
    if (multiCityLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">
              🧠 Recherche des meilleurs vols pour vos {multiCitySegments.length} destinations...
            </p>
            <p className="text-gray-500 mt-2">
              Analyse en cours sur 500+ compagnies
            </p>
          </div>
        </div>
      );
    }

    // Créer les combinaisons de vols
    const combinations = createMultiCityCombinations(flights);
    console.log("Flight combinations:", combinations.length);

    // Filtrer les combinaisons
    const filteredCombinations = combinations.filter(combo => {
      // Filtre par prix
      if (combo.totalPrice < minBudget || combo.totalPrice > maxBudget) return false;
      
      // Filtre par escales pour chaque segment
      for (const [segmentIndex, stopsFilter] of Object.entries(multiCityStopsFilters)) {
        const idx = parseInt(segmentIndex);
        if (stopsFilter.length > 0) {
          const segmentFlight = combo.segments[idx]?.flight;
          if (!segmentFlight) continue;
          const stops = segmentFlight.outbound?.stops ?? 0;
          const matchesFilter = stopsFilter.some(selectedStop => {
            if (selectedStop === 2) return stops >= 2;
            return stops === selectedStop;
          });
          if (!matchesFilter) return false;
        }
      }
      
      return true;
    });

    // Trier les combinaisons
    const sortedCombinations = [...filteredCombinations].sort((a, b) => {
      switch (sortBy) {
        case "best":
          const scoreA = a.totalPrice * 0.6 + a.totalDuration * 0.4;
          const scoreB = b.totalPrice * 0.6 + b.totalDuration * 0.4;
          return scoreA - scoreB;
        case "price":
          return a.totalPrice - b.totalPrice;
        case "duration":
          return a.totalDuration - b.totalDuration;
        default:
          return 0;
      }
    });

    const displayCombinations = sortedCombinations.slice(0, 50); // Limit à 50 combinaisons

    // Calculer les badges pour les combinaisons affichées
    const comboBadges = getMultiCityBadges(displayCombinations);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* En-tête */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ✈️ Résultats Multi-Destinations
            </h2>
            <p className="text-gray-600">
              {combinations.length} combinaisons trouvées • {passengers} passager{passengers > 1 ? 's' : ''} • Classe {cabinClass}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtres */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 className="font-semibold text-lg mb-4">Filtres</h3>

                {/* Tri */}
                <div className="mb-6">
                  <label className="label">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input"
                  >
                    <option value="best">🏆 Meilleur rapport</option>
                    <option value="price">💰 Prix le plus bas</option>
                    <option value="duration">⚡ Plus rapide</option>
                  </select>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <label className="label">
                    Prix total: {minBudget}€ - {maxBudget}€
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Escales par segment */}
                {multiCitySegments.map((segment, idx) => (
                  <div key={idx} className="mb-4">
                    <label className="label">Vol {idx + 1}: {segment.origin}→{segment.destination}</label>
                    <div className="space-y-2">
                      {[0, 1, 2].map(stops => (
                        <label key={stops} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={(multiCityStopsFilters[idx] || []).includes(stops)}
                            onChange={(e) => {
                              const current = multiCityStopsFilters[idx] || [];
                              if (e.target.checked) {
                                setMultiCityStopsFilters({
                                  ...multiCityStopsFilters,
                                  [idx]: [...current, stops]
                                });
                              } else {
                                setMultiCityStopsFilters({
                                  ...multiCityStopsFilters,
                                  [idx]: current.filter(s => s !== stops)
                                });
                              }
                            }}
                          />
                          <span className="text-sm">
                            {stops === 0 ? 'Direct' : stops === 1 ? '1 escale' : '2+ escales'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {displayCombinations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Affichage de {displayCombinations.length} résultat{displayCombinations.length > 1 ? 's' : ''}
                  </p>

                  {displayCombinations.map((combo) => {
                    const badge = comboBadges[combo.id];
                    
                    return (
                      <div key={combo.id} className="bg-white rounded-xl shadow-lg p-6">
                        {/* Badge */}
                        {badge && (
                          <div className="mb-3">
                            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                              badge === 'MEILLEUR' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                              badge === 'MOINS CHER' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                              'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            }`}>
                              {badge === 'MEILLEUR' ? '🏆 MEILLEUR' :
                               badge === 'MOINS CHER' ? '💰 MOINS CHER' :
                               '⚡ PLUS RAPIDE'}
                            </span>
                          </div>
                        )}

                        {/* Prix total */}
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <span className="text-sm text-gray-600">Prix total du voyage</span>
                            <div className="text-3xl font-bold text-primary-600">
                              {combo.totalPrice.toFixed(0)}€
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-600">Durée totale</span>
                            <div className="text-xl font-semibold text-gray-900">
                              {Math.floor(combo.totalDuration / 60)}h {combo.totalDuration % 60}m
                            </div>
                          </div>
                        </div>

                      {/* Segments */}
                      <div className="space-y-4">
                        {combo.segments.map((item, segIdx) => {
                          const flight = item.flight;
                          const carrier = flight.validatingAirlineCodes?.[0] || flight.outbound?.airline || 'XX';
                          const airlineInfo = getAirlineInfo(carrier);
                          const price = Number(flight.price?.total ?? flight.price ?? 0);
                          const stops = flight.outbound?.stops ?? 0;
                          const segment = multiCitySegments[segIdx];

                          return (
                            <div key={segIdx} className="border-l-4 border-primary-500 pl-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="text-xs font-semibold text-primary-600">Vol {segIdx + 1}</span>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {segment?.origin} → {segment?.destination}
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-gray-900">{price.toFixed(0)}€</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {airlineInfo.logo && (
                                  <img 
                                    src={airlineInfo.logo} 
                                    alt={airlineInfo.name}
                                    className="h-6 w-6 object-contain"
                                  />
                                )}
                                <span>{airlineInfo.name}</span>
                                <span>•</span>
                                <span>⏱️ {formatDuration(flight.outbound?.duration)}</span>
                                <span>•</span>
                                <span>
                                  {stops === 0 ? '✈️ Direct' : `🔄 ${stops} escale${stops > 1 ? 's' : ''}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bouton réserver */}
                      <button
                        onClick={() => {
                          // Ouvrir les liens de réservation pour tous les segments
                          combo.segments.forEach(item => {
                            const carrier = item.flight.validatingAirlineCodes?.[0] || item.flight.outbound?.airline || 'XX';
                            const seg = multiCitySegments[item.segmentIndex];
                            const link = generateBookingLink(carrier, seg?.origin, seg?.destination);
                            window.open(link, '_blank');
                          });
                        }}
                        className="w-full mt-4 btn btn-primary"
                      >
                        Réserver cette combinaison →
                      </button>
                    </div>
                  );
                  })}

                  {filteredCombinations.length > displayCombinations.length && (
                    <p className="text-center text-gray-500">
                      + {filteredCombinations.length - displayCombinations.length} autres combinaisons disponibles
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600">Aucune combinaison ne correspond à vos critères de filtrage.</p>
                  <button
                    onClick={() => {
                      setMultiCityStopsFilters({});
                      setMaxBudget(10000);
                    }}
                    className="mt-4 btn btn-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              <button
                onClick={() => window.history.back()}
                className="w-full mt-6 btn btn-secondary"
              >
                ← Modifier la recherche
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Afficher les vols triés et filtrés
  const displayFlights = sortedFlights;

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
                <label className="label mb-2 block text-sm font-medium text-gray-700">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm cursor-pointer hover:border-gray-400 transition"
                >
                  <option value="best">🏆  Meilleur rapport qualité/prix</option>
                  <option value="price">💰  Prix le plus bas</option>
                  <option value="duration">⚡  Vol le plus rapide</option>
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

              {/* Escales Vol Aller */}
              <div>
                <label className="label">Escales Vol Aller</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStopsOutbound.includes(0)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStopsOutbound([...selectedStopsOutbound, 0]);
                        } else {
                          setSelectedStopsOutbound(selectedStopsOutbound.filter((s) => s !== 0));
                        }
                      }}
                    />
                    <span className="text-sm">Direct</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStopsOutbound.includes(1)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStopsOutbound([...selectedStopsOutbound, 1]);
                        } else {
                          setSelectedStopsOutbound(selectedStopsOutbound.filter((s) => s !== 1));
                        }
                      }}
                    />
                    <span className="text-sm">1 escale</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedStopsOutbound.includes(2)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStopsOutbound([...selectedStopsOutbound, 2]);
                        } else {
                          setSelectedStopsOutbound(selectedStopsOutbound.filter((s) => s !== 2));
                        }
                      }}
                    />
                    <span className="text-sm">2+ escales</span>
                  </label>
                </div>
                {selectedStopsOutbound.length > 0 && (
                  <button
                    onClick={() => setSelectedStopsOutbound([])}
                    className="text-xs text-primary-600 hover:underline mt-2"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Escales Vol Retour - Affiché seulement pour aller-retour */}
              {returnDate && (
                <div>
                  <label className="label">Escales Vol Retour</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedStopsInbound.includes(0)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStopsInbound([...selectedStopsInbound, 0]);
                          } else {
                            setSelectedStopsInbound(selectedStopsInbound.filter((s) => s !== 0));
                          }
                        }}
                      />
                      <span className="text-sm">Direct</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedStopsInbound.includes(1)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStopsInbound([...selectedStopsInbound, 1]);
                          } else {
                            setSelectedStopsInbound(selectedStopsInbound.filter((s) => s !== 1));
                          }
                        }}
                      />
                      <span className="text-sm">1 escale</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedStopsInbound.includes(2)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStopsInbound([...selectedStopsInbound, 2]);
                          } else {
                            setSelectedStopsInbound(selectedStopsInbound.filter((s) => s !== 2));
                          }
                        }}
                      />
                      <span className="text-sm">2+ escales</span>
                    </label>
                  </div>
                  {selectedStopsInbound.length > 0 && (
                    <button
                      onClick={() => setSelectedStopsInbound([])}
                      className="text-xs text-primary-600 hover:underline mt-2"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Résultats avec insights IA */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {displayFlights.length} vol
                {displayFlights.length > 1 ? "s" : ""} trouvé
                {displayFlights.length > 1 ? "s" : ""}
              </h2>
            </div>

            {/* IA Insights dynamiques - Temporairement masqué */}
            {false && displayFlights.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-5 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Insights pour votre voyage</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      {(() => {
                        const cheapest = Math.min(...displayFlights.map(f => Number(f.price?.total ?? f.price ?? 0)));
                        const mostExpensive = Math.max(...displayFlights.map(f => Number(f.price?.total ?? f.price ?? 0)));
                        const savings = mostExpensive - cheapest;
                        const savingsPercent = Math.round((savings / mostExpensive) * 100);
                        
                        return (
                          <p>
                            <strong>💰 Économies possibles :</strong> Jusqu'à {savings.toFixed(0)}€ ({savingsPercent}%) entre le vol le moins cher ({cheapest.toFixed(0)}€) et le plus cher ({mostExpensive.toFixed(0)}€)
                          </p>
                        );
                      })()}
                      
                      {(() => {
                        const directFlights = displayFlights.filter(f => (f.outbound?.stops ?? 0) === 0).length;
                        const withStops = displayFlights.length - directFlights;
                        
                        if (directFlights > 0) {
                          const directDurations = displayFlights.filter(f => (f.outbound?.stops ?? 0) === 0).map(f => parseDuration(f.outbound?.duration));
                          const stopsMinDuration = withStops > 0 ? Math.min(...displayFlights.filter(f => (f.outbound?.stops ?? 0) > 0).map(f => parseDuration(f.outbound?.duration))) : 0;
                          const directMinDuration = Math.min(...directDurations);
                          const timeSaved = stopsMinDuration > 0 ? Math.round((stopsMinDuration - directMinDuration) / 60) : 0;
                          
                          return (
                            <p>
                              <strong>⚡ Vols directs :</strong> {directFlights} vol{directFlights > 1 ? 's' : ''} direct{directFlights > 1 ? 's' : ''} disponible{directFlights > 1 ? 's' : ''} • {timeSaved > 0 ? `Gagnez ${timeSaved}h en évitant les escales` : 'Les plus rapides'}
                            </p>
                          );
                        } else {
                          return (
                            <p>
                              <strong>⚡ Escales :</strong> Aucun vol direct disponible • Tous les vols ont au moins 1 escale
                            </p>
                          );
                        }
                      })()}
                      
                      {(() => {
                        // Calculer le décalage horaire (approximatif basé sur les codes aéroports)
                        const timezones = {
                          // Europe
                          'CDG': { offset: 1, city: 'Paris' }, 'ORY': { offset: 1, city: 'Paris' },
                          'LHR': { offset: 0, city: 'Londres' }, 'AMS': { offset: 1, city: 'Amsterdam' },
                          'FRA': { offset: 1, city: 'Frankfurt' }, 'MAD': { offset: 1, city: 'Madrid' },
                          'BCN': { offset: 1, city: 'Barcelona' }, 'FCO': { offset: 1, city: 'Rome' },
                          // Asie
                          'HND': { offset: 9, city: 'Tokyo' }, 'NRT': { offset: 9, city: 'Tokyo' },
                          'ICN': { offset: 9, city: 'Seoul' }, 'PEK': { offset: 8, city: 'Beijing' },
                          'PVG': { offset: 8, city: 'Shanghai' }, 'SIN': { offset: 8, city: 'Singapore' },
                          'BKK': { offset: 7, city: 'Bangkok' }, 'HKG': { offset: 8, city: 'Hong Kong' },
                          'DXB': { offset: 4, city: 'Dubai' }, 'DOH': { offset: 3, city: 'Doha' },
                          // Amérique
                          'JFK': { offset: -5, city: 'New York' }, 'LAX': { offset: -8, city: 'Los Angeles' },
                          'ORD': { offset: -6, city: 'Chicago' }, 'MIA': { offset: -5, city: 'Miami' },
                          'YYZ': { offset: -5, city: 'Toronto' }, 'MEX': { offset: -6, city: 'Mexico' },
                          // Océanie
                          'SYD': { offset: 11, city: 'Sydney' }, 'MEL': { offset: 11, city: 'Melbourne' },
                          'AKL': { offset: 13, city: 'Auckland' },
                        };
                        
                        const originTz = timezones[originCode];
                        const destTz = timezones[destinationCode];
                        
                        if (originTz && destTz) {
                          const diff = destTz.offset - originTz.offset;
                          const absDiff = Math.abs(diff);
                          
                          return (
                            <p>
                              <strong>🌍 Décalage horaire :</strong> {diff === 0 ? 'Aucun décalage' : `${absDiff}h ${diff > 0 ? 'en avance' : 'en retard'} à ${destTz.city}`} • 
                              {absDiff >= 6 ? ' Prévoyez une adaptation au jet lag' : ' Décalage facile à gérer'}
                            </p>
                          );
                        }
                        
                        return null;
                      })()}
                      
                      <p>
                        <strong>🏢 Choix compagnies :</strong> {availableAirlines.length} compagnie{availableAirlines.length > 1 ? 's' : ''} • 
                        {availableAirlines.length > 10 ? ' Très large choix pour optimiser' : availableAirlines.length > 5 ? ' Bon choix disponible' : ' Sélection limitée'}
                      </p>
                      
                      {returnDate && (
                        <p className="text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg inline-block mt-1">
                          ✈️ Recherche aller-retour • Les vols retour sont groupés ci-dessous
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message si aucun vol après filtres */}
            {hasBackendFlights && displayFlights.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-lg font-semibold text-yellow-800 mb-2">
                  Aucun vol ne correspond à vos filtres
                </p>
                <p className="text-sm text-yellow-700">
                  Essayez d'ajuster la fourchette de prix ou les escales pour voir plus de résultats.
                </p>
              </div>
            )}

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
              const flightBadge = flightBadges[flight.id];

              return (
                <div
                  key={flight.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  {/* Badge pratique */}
                  {flightBadge && (
                    <div
                      className={`${flightBadge.color} text-white px-4 py-2 flex items-center space-x-2 text-sm font-bold`}
                    >
                      <Award className="h-4 w-4" />
                      <span>{flightBadge.icon} {flightBadge.label}</span>
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
                                  // Fallback vers un CDN alternatif
                                  if (!e.target.dataset.fallbackTried) {
                                    e.target.dataset.fallbackTried = 'true';
                                    e.target.src = `https://pics.avs.io/64/64/${carrierCode}.png`;
                                  } else {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }
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

                        {/* Vol retour si round trip */}
                        {returnDate && flight.inbound && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                ← Vol retour
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  {flight.inbound?.departure?.time
                                    ? new Date(flight.inbound.departure.time).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {flight.inbound?.departure?.airport || destinationCode}
                                </div>
                              </div>

                              <div className="flex-1 px-6">
                                <div className="flex items-center justify-center space-x-2 text-gray-600">
                                  <div className="h-px bg-gray-300 flex-1"></div>
                                  <Plane className="h-5 w-5 transform rotate-180" />
                                  <div className="h-px bg-gray-300 flex-1"></div>
                                </div>
                                <div className="text-center mt-2">
                                  <div className="text-sm font-medium">
                                    {flight.inbound?.duration ? formatDuration(flight.inbound.duration) : "—"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {flight.inbound?.stops !== undefined
                                      ? flight.inbound.stops === 0
                                        ? "Direct"
                                        : `${flight.inbound.stops} escale${flight.inbound.stops > 1 ? "s" : ""}`
                                      : "—"}
                                  </div>
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  {flight.inbound?.arrival?.time
                                    ? new Date(flight.inbound.arrival.time).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {flight.inbound?.arrival?.airport || originCode}
                                </div>
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
