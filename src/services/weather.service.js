const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Récupérer la météo actuelle d'une ville
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise} Données météo
 */
const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric', // Pour Celsius
        lang: 'fr'
      }
    });

    return {
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      windSpeed: response.data.wind.speed,
      weatherType: response.data.weather[0].main // Clear, Clouds, Rain, etc.
    };
  } catch (error) {
    console.error('Erreur récupération météo:', error.message);
    throw error;
  }
};

/**
 * Filtrer les destinations selon les critères météo
 * @param {Array} destinations - Liste des destinations avec lat/lon
 * @param {Object} criteria - Critères de filtrage
 * @returns {Promise<Array>} Destinations filtrées
 */
const filterDestinationsByWeather = async (destinations, criteria) => {
  // Limiter à 30 destinations pour ne pas dépasser les limites API
  const sample = destinations.sort(() => 0.5 - Math.random()).slice(0, 30);
  
  const weatherPromises = sample.map(async (dest) => {
    try {
      const weather = await getCurrentWeather(dest.lat, dest.lon);
      return { ...dest, weather };
    } catch (error) {
      return null;
    }
  });

  const destinationsWithWeather = (await Promise.all(weatherPromises))
    .filter(d => d !== null);

  // Filtrer selon les critères
  return destinationsWithWeather.filter(dest => {
    const { weather } = dest;
    
    // Filtre météo (sunny, mild, cold)
    if (criteria.weather) {
      if (criteria.weather === 'sunny' && !['Clear'].includes(weather.weatherType)) {
        return false;
      }
      if (criteria.weather === 'mild' && ['Rain', 'Snow', 'Thunderstorm'].includes(weather.weatherType)) {
        return false;
      }
      if (criteria.weather === 'cold' && weather.temperature > 10) {
        return false;
      }
    }

    // Filtre température
    if (criteria.temperature) {
      if (criteria.temperature === 'hot' && weather.temperature < 25) return false;
      if (criteria.temperature === 'warm' && (weather.temperature < 15 || weather.temperature > 25)) return false;
      if (criteria.temperature === 'cool' && (weather.temperature < 5 || weather.temperature > 15)) return false;
      if (criteria.temperature === 'cold' && weather.temperature > 5) return false;
    }

    return true;
  });
};

module.exports = {
  getCurrentWeather,
  filterDestinationsByWeather
};
