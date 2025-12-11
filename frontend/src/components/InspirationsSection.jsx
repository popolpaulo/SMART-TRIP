import { useState, useEffect } from "react";
import { TrendingUp, MapPin, ArrowRight, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InspirationsSection() {
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularDestinations();
  }, []);

  const fetchPopularDestinations = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/search/popular-destinations");
      if (response.ok) {
        const data = await response.json();
        // Prendre les 6 destinations les plus populaires
        setPopularDestinations((data.destinations || []).slice(0, 6));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des inspirations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Images par défaut pour les destinations populaires
  const destinationImages = {
    NYC: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    LON: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
    TOK: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    BCN: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
    ROM: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    DXB: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
    BKK: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop",
    IST: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
    SYD: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
    HND: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  };

  // Noms des villes
  const cityNames = {
    NYC: "New York",
    LON: "Londres",
    TOK: "Tokyo",
    BCN: "Barcelone",
    ROM: "Rome",
    DXB: "Dubaï",
    BKK: "Bangkok",
    IST: "Istanbul",
    SYD: "Sydney",
    HND: "Tokyo",
    CDG: "Paris",
    LHR: "Londres",
    JFK: "New York",
  };

  const handleDestinationClick = (destination) => {
    // Naviguer vers la recherche avec cette destination pré-remplie
    const today = new Date();
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + 30);
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    navigate(
      `/search?origin=CDG&destination=${destination.destination_code}&departureDate=${departureDate.toISOString().split("T")[0]}&returnDate=${returnDate.toISOString().split("T")[0]}&passengers=1&class=economy&tripType=roundtrip`
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (popularDestinations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full mb-4">
            <Flame className="h-5 w-5" />
            <span className="font-semibold">Tendances du moment</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Destinations populaires
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les destinations les plus recherchées par nos voyageurs
          </p>
        </div>

        {/* Grille de destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDestinations.map((destination, index) => {
            const cityName = cityNames[destination.destination_code] || destination.destination_code;
            const image = destinationImages[destination.destination_code] || destinationImages.NYC;

            return (
              <div
                key={destination.destination_code}
                onClick={() => handleDestinationClick(destination)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={cityName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Badge tendance */}
                  {index < 3 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold shadow-lg">
                      <Flame className="h-4 w-4" />
                      <span>Top {index + 1}</span>
                    </div>
                  )}

                  {/* Nom de la ville */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 text-white mb-2">
                      <MapPin className="h-5 w-5" />
                      <h3 className="text-2xl font-bold">{cityName}</h3>
                    </div>
                    <p className="text-white/80 text-sm">
                      {destination.search_count} recherche{destination.search_count > 1 ? "s" : ""} cette semaine
                    </p>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>En hausse</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Vol depuis Paris (CDG)
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Plus de 50 destinations analysées en temps réel
          </p>
          <button
            onClick={() => navigate("/search")}
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            <span>Explorer toutes les destinations</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
