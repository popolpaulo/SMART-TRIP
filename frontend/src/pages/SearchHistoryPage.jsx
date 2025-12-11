import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Trash2, ArrowRight, Calendar, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SearchHistoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchHistory();
  }, [isAuthenticated, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/search/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique');
      }

      const data = await response.json();
      setHistory(data.history || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/search/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Error deleting history entry:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/search/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory([]);
      } else {
        throw new Error('Erreur lors de l\'effacement');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      alert('Erreur lors de l\'effacement de l\'historique');
    }
  };

  const handleSearchAgain = (item) => {
    const params = new URLSearchParams({
      origin: item.origin_code,
      destination: item.destination_code,
      departureDate: item.departure_date,
      passengers: item.adults + item.children,
      class: item.travel_class || 'economy'
    });

    if (item.return_date) {
      params.append('returnDate', item.return_date);
    }

    navigate(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <History className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Historique de Recherche
              </h1>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tout effacer
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Retrouvez vos recherches précédentes
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
        {history.length === 0 && !error && (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun historique pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vos recherches de vols apparaîtront ici
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Rechercher des vols
            </button>
          </div>
        )}

        {/* Liste d'historique */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Itinéraire */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.origin_code}
                        </span>
                        {item.origin_city && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({item.origin_city})
                          </span>
                        )}
                      </div>

                      <ArrowRight className={`h-5 w-5 ${item.search_type === 'round-trip' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />

                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.destination_code}
                        </span>
                        {item.destination_city && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({item.destination_city})
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.search_type === 'round-trip'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.search_type === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(item.departure_date).toLocaleDateString('fr-FR')}
                          {item.return_date && ` - ${new Date(item.return_date).toLocaleDateString('fr-FR')}`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {item.adults} adulte{item.adults > 1 ? 's' : ''}
                          {item.children > 0 && `, ${item.children} enfant${item.children > 1 ? 's' : ''}`}
                        </span>
                      </div>

                      {item.travel_class && (
                        <span className="capitalize">{item.travel_class}</span>
                      )}
                    </div>

                    {/* Date de recherche */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Recherché le {new Date(item.searched_at).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(item.searched_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleSearchAgain(item)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
