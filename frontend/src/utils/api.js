import axios from "axios";

// Configuration de base pour axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 30000, // 30 secondes pour les recherches de vols
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Ajouter le token JWT si disponible
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers la page de connexion
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================
// API FUNCTIONS - Flights
// ============================================

/**
 * Recherche intelligente de vols avec scoring IA
 */
export const searchFlights = async (searchParams) => {
  try {
    const response = await api.post("/api/flights/search", searchParams);
    return response.data.data;
  } catch (error) {
    console.error("Error searching flights:", error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la recherche de vols"
    );
  }
};

/**
 * Recherche avec comparaison multi-pays (VPN)
 */
export const searchFlightsVPN = async (searchParams) => {
  try {
    const response = await api.post("/api/flights/search-vpn", searchParams);
    return response.data.data;
  } catch (error) {
    console.error("Error VPN search:", error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la recherche VPN"
    );
  }
};

/**
 * Prédiction de prix avec Machine Learning
 */
export const predictPrices = async (searchParams) => {
  try {
    const response = await api.post(
      "/api/flights/predict-prices",
      searchParams
    );
    return response.data.data;
  } catch (error) {
    console.error("Error predicting prices:", error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la prédiction des prix"
    );
  }
};

export default api;
