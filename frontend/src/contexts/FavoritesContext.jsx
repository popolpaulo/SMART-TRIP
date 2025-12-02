import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Charger les favoris au montage si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Récupérer tous les favoris
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des favoris");
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un vol aux favoris
  const addFavorite = async (flightData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout du favori");
      }

      const data = await response.json();
      setFavorites((prev) => [data.favorite, ...prev]);
      return { success: true, favorite: data.favorite };
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un favori
  const removeFavorite = async (favoriteId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du favori");
      }

      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
      return { success: true };
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les notes d'un favori
  const updateFavoriteNotes = async (favoriteId, notes) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/favorites/${favoriteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userNotes: notes }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du favori");
      }

      const data = await response.json();
      setFavorites((prev) =>
        prev.map((fav) => (fav.id === favoriteId ? data.favorite : fav))
      );
      return { success: true, favorite: data.favorite };
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un vol est dans les favoris
  const isFavorite = (airlineCode, flightNumber, departureDatetime) => {
    return favorites.some(
      (fav) =>
        fav.airline_code === airlineCode &&
        fav.flight_number === flightNumber &&
        new Date(fav.departure_datetime).getTime() ===
          new Date(departureDatetime).getTime()
    );
  };

  // Obtenir l'ID du favori s'il existe
  const getFavoriteId = (airlineCode, flightNumber, departureDatetime) => {
    const favorite = favorites.find(
      (fav) =>
        fav.airline_code === airlineCode &&
        fav.flight_number === flightNumber &&
        new Date(fav.departure_datetime).getTime() ===
          new Date(departureDatetime).getTime()
    );
    return favorite ? favorite.id : null;
  };

  // Toggle favorite (ajouter ou supprimer)
  const toggleFavorite = async (flightData) => {
    const favId = getFavoriteId(
      flightData.airlineCode,
      flightData.flightNumber,
      flightData.departureDatetime
    );

    if (favId) {
      return await removeFavorite(favId);
    } else {
      return await addFavorite(flightData);
    }
  };

  const value = {
    favorites,
    loading,
    error,
    loadFavorites,
    addFavorite,
    removeFavorite,
    updateFavoriteNotes,
    isFavorite,
    getFavoriteId,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
