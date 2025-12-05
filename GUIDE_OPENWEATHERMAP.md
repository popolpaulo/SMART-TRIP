# Guide d'implémentation de l'API OpenWeatherMap

## 1. Obtenir une clé API

1. Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Aller dans "API keys" dans votre profil
3. Copier votre clé API (gratuite jusqu'à 60 appels/minute)

## 2. Configurer les variables d'environnement

### Backend (.env)
```env
OPENWEATHER_API_KEY=votre_cle_api_ici
```

## 3. Créer le service météo (Backend)

### Créer `src/services/weather.service.js`

```javascript
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
  const weatherPromises = destinations.map(async (dest) => {
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
      if (criteria.weather === 'sunny' && !['Clear', 'Clouds'].includes(weather.weatherType)) {
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
```

## 4. Créer la route API (Backend)

### Ajouter dans `src/routes/` un nouveau fichier `inspiration.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const weatherService = require('../services/weather.service');
const { DESTINATIONS } = require('../utils/destinations'); // Copier destinations.js du frontend

/**
 * POST /api/inspiration
 * Trouver des destinations selon critères météo
 */
router.post('/', async (req, res) => {
  try {
    const { weather, temperature, budget, activities } = req.body;

    // Filtrer par météo d'abord
    let filteredDestinations = await weatherService.filterDestinationsByWeather(
      DESTINATIONS,
      { weather, temperature }
    );

    // TODO: Ajouter filtres budget et activités si nécessaire
    
    // Limiter à 5 suggestions aléatoires
    const suggestions = filteredDestinations
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Erreur inspiration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de destinations'
    });
  }
});

module.exports = router;
```

### Enregistrer la route dans `server.js`

```javascript
const inspirationRoutes = require('./src/routes/inspiration.routes');
app.use('/api/inspiration', inspirationRoutes);
```

## 5. Mettre à jour le Frontend

### Modifier `frontend/src/pages/LandingPage.jsx`

Remplacer la fonction `handleInspirationSubmit` :

```javascript
const handleInspirationSubmit = async () => {
  setShowInspirationModal(false);
  setIsInspirationMode(true);
  
  try {
    // Appeler l'API backend
    const response = await fetch('http://localhost:3000/api/inspiration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inspirationCriteria)
    });

    const data = await response.json();
    
    if (data.success && data.suggestions.length > 0) {
      // Prendre la première suggestion
      const destination = data.suggestions[0];
      setSearchQuery(destination.city);
      setZoomToDestination(destination.city);
      
      // Optionnel : Afficher les infos météo
      console.log('Météo:', destination.weather);
    } else {
      // Fallback si aucune destination trouvée
      const randomDestination = CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)];
      setSearchQuery(randomDestination);
      setZoomToDestination(randomDestination);
    }
  } catch (error) {
    console.error('Erreur inspiration:', error);
    // Fallback en cas d'erreur
    const randomDestination = CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)];
    setSearchQuery(randomDestination);
    setZoomToDestination(randomDestination);
  } finally {
    setIsInspirationMode(false);
  }
};
```

## 6. Test et déploiement

### Tester localement

```bash
# Backend
cd SMART-TRIP
npm install axios
node server.js

# Frontend
cd frontend
npm run dev
```

### Variables d'environnement Docker

Ajouter dans `docker-compose.yml` :

```yaml
services:
  backend:
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
```

Créer `.env` à la racine :
```env
OPENWEATHER_API_KEY=votre_cle_api
```

## 7. Optimisations possibles

1. **Cache Redis** : Mettre en cache les données météo (valables 30 min)
2. **Batch requests** : Appeler l'API pour plusieurs villes en une fois
3. **Filtre intelligent** : Pondérer les suggestions selon plusieurs critères
4. **Affichage météo** : Montrer la météo dans les suggestions du modal

## 8. Limites de l'API gratuite

- 60 appels/minute
- 1 000 000 appels/mois
- Données actuelles uniquement (pas de prévisions avancées)

Pour des fonctionnalités avancées, envisager le plan payant ($40/mois pour 2000 appels/minute).
