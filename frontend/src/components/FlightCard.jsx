import { useState } from 'react';
import { Heart, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FlightCard({ flight, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (isFavorite) {
        // Supprimer des favoris
        const response = await fetch(`http://localhost:3000/api/favorites/${flight.favoriteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          if (onFavoriteToggle) onFavoriteToggle(flight.id, false);
        }
      } else {
        // Ajouter aux favoris
        const favoriteData = {
          airlineCode: flight.airlineCode,
          airlineName: flight.airline,
          flightNumber: flight.segments?.[0]?.number || 'N/A',
          originCode: flight.segments?.[0]?.departure?.iataCode || flight.origin,
          originCity: flight.segments?.[0]?.departure?.city || '',
          destinationCode: flight.segments?.[flight.segments?.length - 1]?.arrival?.iataCode || flight.destination,
          destinationCity: flight.segments?.[flight.segments?.length - 1]?.arrival?.city || '',
          departureDatetime: flight.segments?.[0]?.departure?.at || flight.departureTime,
          arrivalDatetime: flight.segments?.[flight.segments?.length - 1]?.arrival?.at || flight.arrivalTime,
          durationMinutes: parseInt(flight.duration?.replace(/[^0-9]/g, '')) || 0,
          stops: flight.segments?.length - 1 || 0,
          cabinClass: flight.cabinClass || 'economy',
          priceAmount: flight.price,
          priceCurrency: 'EUR',
          carbonFootprintKg: flight.co2Emissions || 0,
        };

        const response = await fetch('http://localhost:3000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(favoriteData)
        });

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(true);
          flight.favoriteId = data.favorite.id;
          if (onFavoriteToggle) onFavoriteToggle(flight.id, true, data.favorite.id);
        } else {
          const error = await response.json();
          if (response.status === 409) {
            alert('Ce vol est déjà dans vos favoris');
          } else {
            throw new Error(error.error || 'Erreur lors de l\'ajout');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la mise à jour des favoris');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
      {/* Bouton Favori */}
      <button
        onClick={handleFavoriteClick}
        disabled={loading}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
          isFavorite
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart
          className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
        />
      </button>

      {/* Contenu de la carte */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {flight.airline}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {flight.price}€
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">par personne</div>
        </div>
      </div>

      {/* Itinéraire */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {flight.departureTime}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{flight.origin}</div>
        </div>

        <div className="flex-1 flex flex-col items-center mx-4">
          <Clock className="h-4 w-4 text-gray-400 mb-1" />
          <div className="text-sm text-gray-500 dark:text-gray-400">{flight.duration}</div>
          <div className="w-full h-px bg-gray-300 dark:bg-gray-600 relative">
            <ArrowRight className="h-4 w-4 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800" />
          </div>
          {flight.stops > 0 && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {flight.stops} escale{flight.stops > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {flight.arrivalTime}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{flight.destination}</div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      {flight.co2Emissions && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          🌱 Émissions CO₂: {flight.co2Emissions} kg
        </div>
      )}

      {/* Bouton de réservation */}
      <a
        href={flight.bookingLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Réserver
        <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </div>
  );
}
