import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Plane, Clock, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des favoris');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.id !== id));
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Error deleting favorite:', err);
      alert('Erreur lors de la suppression du favori');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes Vols Favoris
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Retrouvez tous les vols que vous avez sauvegardés
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Liste vide */}
        {favorites.length === 0 && !error && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ajoutez des vols à vos favoris pour les retrouver facilement
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Rechercher des vols
            </button>
          </div>
        )}

        {/* Grille de favoris */}
        {favorites.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative"
              >
                {/* Bouton supprimer */}
                <button
                  onClick={() => handleDelete(favorite.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  aria-label="Supprimer des favoris"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Compagnie et prix */}
                <div className="flex items-center justify-between mb-4 pr-8">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {favorite.airline_name}
                    </span>
                  </div>
                </div>

                <div className="text-right mb-4">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {favorite.price_amount}€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">par personne</div>
                </div>

                {/* Itinéraire */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {favorite.origin_code}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {favorite.origin_city}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center mx-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {formatDuration(favorite.duration_minutes)}
                      </div>
                      <div className="w-full h-px bg-gray-300 dark:bg-gray-600 relative">
                        <ArrowRight className="h-3 w-3 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800" />
                      </div>
                      {favorite.stops > 0 && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {favorite.stops} escale{favorite.stops > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {favorite.destination_code}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {favorite.destination_city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date et heure */}
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 space-y-1">
                  <div>
                    <span className="font-medium">Départ:</span> {formatDate(favorite.departure_datetime)}
                  </div>
                  <div>
                    <span className="font-medium">Arrivée:</span> {formatDate(favorite.arrival_datetime)}
                  </div>
                </div>

                {/* Informations supplémentaires */}
                {favorite.carbon_footprint_kg && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    🌱 {favorite.carbon_footprint_kg} kg CO₂
                  </div>
                )}

                {/* Notes personnelles */}
                {favorite.user_notes && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    {favorite.user_notes}
                  </div>
                )}

                {/* Date d'ajout */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Ajouté le {new Date(favorite.created_at).toLocaleDateString('fr-FR')}
                </div>

                {/* Bouton rechercher des vols similaires */}
                <button
                  onClick={() => navigate(`/?origin=${favorite.origin_code}&destination=${favorite.destination_code}&departureDate=${favorite.departure_datetime.split('T')[0]}`)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center justify-center"
                >
                  Rechercher des vols similaires
                  <ExternalLink className="ml-2 h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
