import { TrendingUp, MapPin, DollarSign } from "lucide-react";

export default function TrendingDestinations({ destinations, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si nous avons des destinations
  if (!destinations || destinations.length === 0) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Aucune destination disponible
            </h2>
            <p className="text-gray-600 mt-4">
              Revenez bientôt pour découvrir nos destinations tendances !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Destinations populaires</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Où voyager cette semaine ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les destinations les plus recherchées par nos utilisateurs
          </p>
        </div>

        {/* Grille de destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((destination) => (
            <div
              key={destination.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image_url}
                  alt={destination.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `https://source.unsplash.com/800x600/?${destination.city},travel`;
                  }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Badge score */}
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-accent-600" />
                    <span className="text-sm font-bold text-gray-900">
                      {destination.trend_score
                        ? Math.round(destination.trend_score)
                        : "0"}
                    </span>
                  </div>
                </div>

                {/* Ville et pays */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">
                    {destination.city}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{destination.country_name}</span>
                  </div>
                </div>
              </div>

              {/* Informations */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">À partir de</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-primary-600">
                        {destination.min_price || destination.average_price
                          ? Math.round(
                              destination.min_price || destination.average_price
                            )
                          : "0"}
                        €
                      </span>
                      <span className="text-sm text-gray-500">/ pers</span>
                    </div>
                    {/* Afficher disclaimer si prix non mis à jour */}
                    {!destination.min_price && destination.average_price && (
                      <p className="text-xs text-amber-600 mt-1">
                        Prix indicatif
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Recherches</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {destination.search_count
                        ? destination.search_count.toLocaleString()
                        : "0"}
                    </p>
                  </div>
                </div>

                {destination.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {destination.description}
                  </p>
                )}

                {/* Bouton */}
                <button className="w-full mt-4 btn btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir les vols
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton voir plus */}
        <div className="text-center mt-12">
          <button className="btn btn-secondary px-8">
            Voir toutes les destinations
          </button>
        </div>
      </div>
    </div>
  );
}
