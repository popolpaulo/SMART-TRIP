import { TrendingUp, MapPin, DollarSign } from "lucide-react";

// Mapping des codes aéroport vers noms de villes
const cityNames = {
  NYC: "New York",
  JFK: "New York",
  LHR: "Londres",
  LON: "Londres",
  HND: "Tokyo",
  NRT: "Tokyo",
  CDG: "Paris",
  BCN: "Barcelone",
  ROM: "Rome",
  FCO: "Rome",
  DXB: "Dubaï",
  BKK: "Bangkok",
  IST: "Istanbul",
  SYD: "Sydney",
};

// Images par défaut
const cityImages = {
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
  Londres: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
  Tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  Barcelone: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
};

export default function TrendingDestinations({ destinations, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Si aucune destination n'a été recherchée, ne rien afficher
  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Destinations populaires</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Où voyager cette semaine ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les destinations les plus recherchées par nos utilisateurs
          </p>
        </div>

        {/* Grille de destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((destination, index) => {
            const cityName = cityNames[destination.destination_code] || destination.destination_code;
            const imageUrl = cityImages[cityName] || `https://source.unsplash.com/800x600/?${cityName},travel`;
            
            return (
              <div
                key={`${destination.destination_code}-${index}`}
                className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={cityName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Badge ranking */}
                  {index < 3 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                  )}

                  {/* Ville */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{cityName}</h3>
                    <div className="flex items-center space-x-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{destination.destination_code}</span>
                    </div>
                  </div>
                </div>

                {/* Informations */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recherches</p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {destination.search_count || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cette semaine</p>
                      <TrendingUp className="h-6 w-6 text-green-500 mx-auto" />
                    </div>
                  </div>

                  {/* Bouton */}
                  <button className="w-full mt-4 btn btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir les vols
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
