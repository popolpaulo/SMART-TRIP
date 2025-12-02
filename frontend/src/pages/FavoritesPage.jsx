import { useState, useEffect } from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import {
  Heart,
  Plane,
  Clock,
  Calendar,
  Euro,
  Trash2,
  Edit3,
  Save,
  X,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function FavoritesPage() {
  const { favorites, loading, removeFavorite, updateFavoriteNotes } =
    useFavorites();
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce favori ?")) {
      setDeleting(id);
      await removeFavorite(id);
      setDeleting(null);
    }
  };

  const handleEditNotes = (favorite) => {
    setEditingId(favorite.id);
    setEditNotes(favorite.user_notes || "");
  };

  const handleSaveNotes = async (id) => {
    await updateFavoriteNotes(id, editNotes);
    setEditingId(null);
    setEditNotes("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, "0") : ""}`;
  };

  const formatDateTime = (dateTime) => {
    try {
      return format(new Date(dateTime), "dd MMM yyyy à HH:mm", { locale: fr });
    } catch {
      return dateTime;
    }
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Chargement de vos favoris...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Mes Coups de Cœur
            </h1>
          </div>
          <p className="text-gray-600">
            {favorites.length}{" "}
            {favorites.length > 1 ? "vols sauvegardés" : "vol sauvegardé"}
          </p>
        </div>

        {/* Liste des favoris */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-500">
              Ajoutez des vols à vos favoris pour les retrouver facilement
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informations du vol */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Plane className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-lg text-gray-900">
                        {favorite.airline_name || "Compagnie aérienne"}
                      </span>
                      <span className="text-gray-500">
                        • Vol {favorite.flight_number}
                      </span>
                    </div>

                    {/* Trajet */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {favorite.origin_city || favorite.origin_code}
                        </span>
                      </div>
                      <div className="flex-1 border-t border-gray-300 relative">
                        <Plane className="h-4 w-4 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {favorite.destination_city ||
                            favorite.destination_code}
                        </span>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(favorite.departure_datetime)}</span>
                      </div>
                      {favorite.duration_minutes && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Durée: {formatDuration(favorite.duration_minutes)}
                          </span>
                        </div>
                      )}
                      {favorite.stops !== undefined && (
                        <span>
                          {favorite.stops === 0
                            ? "Direct"
                            : `${favorite.stops} escale${
                                favorite.stops > 1 ? "s" : ""
                              }`}
                        </span>
                      )}
                      {favorite.cabin_class && (
                        <span className="capitalize">
                          {favorite.cabin_class === "economy"
                            ? "Économique"
                            : favorite.cabin_class}
                        </span>
                      )}
                    </div>

                    {/* Notes personnelles */}
                    {editingId === favorite.id ? (
                      <div className="mt-4">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ajoutez vos notes personnelles..."
                          rows="3"
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleSaveNotes(favorite.id)}
                            className="btn btn-primary btn-sm flex items-center space-x-1"
                          >
                            <Save className="h-4 w-4" />
                            <span>Enregistrer</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary btn-sm flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span>Annuler</span>
                          </button>
                        </div>
                      </div>
                    ) : favorite.user_notes ? (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 italic">
                          {favorite.user_notes}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Prix et Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start space-y-0 lg:space-y-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-2xl font-bold text-primary-600">
                        <Euro className="h-6 w-6" />
                        <span>{favorite.price_amount}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Prix au{" "}
                        {format(new Date(favorite.created_at), "dd/MM/yyyy")}
                      </p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditNotes(favorite)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Modifier les notes"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(favorite.id)}
                        disabled={deleting === favorite.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
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
