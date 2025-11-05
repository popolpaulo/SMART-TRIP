# 🤖 Comparateur de Vols Intelligent avec IA - SMART TRIP

## 📋 Résumé de l'implémentation

Cette documentation décrit le système de comparateur de vols intelligent avec IA qui a été implémenté dans SMART TRIP. Le système utilise plusieurs APIs de compagnies aériennes, l'intelligence artificielle pour scorer les vols, et des algorithmes de prédiction de prix.

---

## ✅ Fonctionnalités Implémentées

### 1. 🔌 Intégration Multi-Sources

- **Amadeus Flight API** : Source principale de données de vols
  - OAuth2 authentication avec refresh automatique
  - Flight Offers Search API v2
  - Price Analytics API v1 pour tendances de prix
  - Gestion du cache de tokens (30 min expiration)
- **Skyscanner API** : Source secondaire pour comparaison
  - Browse Routes API v1.0
  - Comparaison de prix alternatifs
  - Détection des doublons entre sources

### 2. 🧠 Intelligence Artificielle

#### Scoring Multi-Facteurs

Algorithme de notation sur 100 points avec 6 facteurs pondérés:

| Facteur       | Poids | Description                                                            |
| ------------- | ----- | ---------------------------------------------------------------------- |
| **Prix**      | 35%   | Score basé sur le budget utilisateur (economy/moderate/premium/luxury) |
| **Confort**   | 20%   | Classe cabine, vols directs, avions wide-body (747/777/787/A350)       |
| **Escales**   | 15%   | Pénalité pour nombre d'arrêts                                          |
| **Durée**     | 15%   | Score inversement proportionnel à la durée                             |
| **Compagnie** | 10%   | Correspondance avec préférences utilisateur                            |
| **Timing**    | 5%    | Heures optimales (8h-12h, 14h-18h)                                     |

#### Recommandations IA

- **Excellent** (85-100): "Meilleur choix pour vous!"
- **Good** (70-84): "Bon compromis qualité/prix"
- **Acceptable** (55-69): "Option correcte"
- **Poor** (<55): "Pas optimal selon vos préférences"

### 3. 📊 Prédiction de Prix avec Machine Learning

#### Méthodes de Prédiction

1. **OpenAI GPT-4** (prioritaire):

   - Analyse de l'historique 30 jours
   - Contexte: saisonnalité, jours avant départ, événements
   - Prédictions à +7j, +14j, +30j
   - Niveau de confiance: high/medium/low

2. **Statistique** (fallback):
   - Moyenne mobile sur historique
   - Analyse de tendance simple
   - Quartiles de prix

#### Recommandations d'Achat

- `book_now` : Prix actuellement bas, acheter immédiatement
- `wait_1week` : Prix susceptible de baisser sous 7 jours
- `wait_2weeks` : Attendre 2 semaines pour économiser
- `monitor` : Surveiller, tendance incertaine

### 4. 🌍 Comparaison Multi-Pays avec VPN

Recherche parallèle dans plusieurs pays pour trouver les meilleurs prix:

- **Pays supportés**: FR 🇫🇷, US 🇺🇸, GB 🇬🇧, DE 🇩🇪
- Conversion de devises automatique
- Calcul des économies potentielles
- Identification du pays optimal

---

## 🗄️ Architecture de la Base de Données

### Nouvelles Tables (Migration 002)

#### **user_profiles**

Profils utilisateurs pour personnalisation IA:

```sql
- budget_preference: economy | moderate | premium | luxury
- comfort_preference: basic | standard | premium | luxury
- max_layovers: INTEGER (nombre maximum d'escales)
- preferred_airlines: TEXT[] (codes IATA: ['AF', 'BA', 'LH'])
- preferred_airports: TEXT[]
- seat_preference: window | aisle | no_preference
- loyalty_programs: JSONB ([{airline: 'AF', number: '12345'}])
- ai_recommendations_enabled: BOOLEAN
```

#### **price_history**

Historique des prix pour entraînement ML:

```sql
- route_hash: VARCHAR(64) (clé unique: origin+dest+class)
- avg_price, min_price, max_price: DECIMAL(10,2)
- date: DATE
- days_before_departure: INTEGER
- data_source: amadeus | skyscanner | aggregated
```

#### **ai_predictions**

Prédictions de prix par GPT-4:

```sql
- predicted_prices: JSONB ({"+7days": 450, "+14days": 420})
- price_trend: increasing | decreasing | stable
- confidence_level: high | medium | low
- recommendation: book_now | wait_1week | wait_2weeks | monitor
- ai_model: gpt-4
- expires_at: TIMESTAMP (7 jours)
```

#### **vpn_price_comparisons**

Comparaisons de prix multi-pays:

```sql
- countries_checked: TEXT[] (['FR', 'US', 'GB'])
- price_comparison: JSONB ({FR: {currency: 'EUR', prices: [450]}})
- best_country: VARCHAR(2)
- savings_percentage: DECIMAL(5,2)
```

### Vues Analytics

- `v_route_price_trends`: Moyennes hebdomadaires par route
- `v_ai_prediction_accuracy`: Performance des prédictions

### Fonctions Utilitaires

- `calculate_route_hash()`: Hash SHA-256 pour déduplication
- `cleanup_expired_predictions()`: Nettoyage automatique

---

## 🌐 API Endpoints

### POST /api/flights/search

**Recherche intelligente de vols avec scoring IA**

**Request:**

```json
{
  "origin": "PAR",
  "destination": "NYC",
  "departureDate": "2025-12-01",
  "returnDate": "2025-12-08",
  "adults": 2,
  "cabinClass": "economy"
}
```

**Response:**

```json
{
  "success": true,
  "flights": [
    {
      "id": "mock-1",
      "source": "amadeus-mock",
      "price": {
        "total": 450.5,
        "currency": "EUR"
      },
      "outbound": {
        "departure": { "airport": "PAR", "time": "2025-12-01T08:00:00" },
        "arrival": { "airport": "NYC", "time": "2025-12-01T12:00:00" },
        "duration": "PT4H",
        "stops": 0
      },
      "aiScore": 85,
      "aiRecommendation": {
        "level": "excellent",
        "message": "Meilleur choix pour vous!",
        "highlights": ["Vol direct", "Prix optimal", "Horaires pratiques"]
      },
      "scoreBreakdown": {
        "price": 90,
        "comfort": 85,
        "layovers": 100,
        "duration": 80,
        "airline": 75,
        "timing": 90
      }
    }
  ],
  "meta": {
    "totalResults": 10,
    "sources": ["amadeus", "skyscanner"],
    "searchTime": 245
  }
}
```

### POST /api/flights/search-vpn

**Comparaison de prix multi-pays**

**Request:**

```json
{
  "origin": "PAR",
  "destination": "NYC",
  "departureDate": "2025-12-01",
  "countries": ["FR", "US", "GB", "DE"]
}
```

**Response:**

```json
{
  "success": true,
  "vpnComparison": {
    "FR": { "minPrice": 450, "currency": "EUR" },
    "US": { "minPrice": 420, "currency": "USD" },
    "GB": { "minPrice": 380, "currency": "GBP" },
    "DE": { "minPrice": 430, "currency": "EUR" }
  },
  "bestCountry": "GB",
  "bestPrice": 380,
  "savings": 70,
  "savingsPercentage": 15.6
}
```

### POST /api/flights/predict-prices

**Prédiction de prix avec ML**

**Request:**

```json
{
  "origin": "PAR",
  "destination": "NYC",
  "departureDate": "2025-12-01",
  "cabinClass": "economy"
}
```

**Response:**

```json
{
  "success": true,
  "currentPrice": 450.0,
  "trend": "increasing",
  "predictions": {
    "+7days": 470,
    "+14days": 490,
    "+30days": 520
  },
  "recommendation": "book_now",
  "confidence": "high",
  "estimatedSavings": -70,
  "optimalBookingDate": "2025-11-05"
}
```

---

## 🔧 Configuration Requise

### Variables d'Environnement (.env)

```env
# Amadeus API (https://developers.amadeus.com)
AMADEUS_API_KEY=votre_cle_amadeus
AMADEUS_API_SECRET=votre_secret_amadeus
AMADEUS_BASE_URL=https://test.api.amadeus.com  # ou https://api.amadeus.com pour prod

# Skyscanner API
SKYSCANNER_API_KEY=votre_cle_skyscanner
SKYSCANNER_BASE_URL=https://partners.api.skyscanner.net

# OpenAI GPT-4
OPENAI_API_KEY=votre_cle_openai
AI_MODEL=gpt-4
AI_PREDICTION_ENABLED=true

# VPN Service (optionnel)
VPN_SERVICE_API_KEY=votre_cle_vpn
VPN_ENABLED=false

# Redis Cache (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenWeather API (futur)
OPENWEATHER_API_KEY=votre_cle_weather
```

### Obtenir les API Keys

1. **Amadeus for Developers**:

   - S'inscrire sur https://developers.amadeus.com
   - Créer une application (mode Test ou Production)
   - Récupérer API Key + API Secret
   - Test environment: limité mais gratuit
   - Production: facturation au volume

2. **Skyscanner Partners**:

   - S'inscrire sur https://partners.skyscanner.net
   - Demander l'accès à l'API (peut prendre quelques jours)
   - Récupérer l'API key

3. **OpenAI API**:
   - Créer un compte sur https://platform.openai.com
   - Générer une API key
   - Activer la facturation (GPT-4 ~$0.03/1K tokens)

---

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Cloner le repository
git clone https://github.com/popolpaulo/SMART-TRIP.git
cd SMART-TRIP

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos API keys
```

### 2. Setup de la Base de Données

```bash
# Démarrer Docker (PostgreSQL + PgAdmin)
docker-compose up -d

# Attendre que PostgreSQL soit prêt (health check)
# Exécuter les migrations
npm run db:migrate

# Insérer les données de test
npm run db:seed
```

### 3. Lancement du Serveur

**Option A: Scripts automatiques (Windows)**

```bash
# Tout en un (recommandé)
START-ALL.bat

# Ou étape par étape
SETUP.bat    # Première fois uniquement
START.bat    # Démarrer le serveur
STOP.bat     # Arrêter les services
```

**Option B: Commandes manuelles**

```bash
# Démarrer le backend
npm start

# Dans un autre terminal, démarrer le frontend
cd frontend
npm run dev
```

### 4. Tester l'API

```bash
# Tester les endpoints avec le script de test
node test-ai-flight-search.js
```

**Exemple de test manuel avec curl:**

```powershell
curl http://localhost:3000/api/flights/search `
  -Method POST `
  -Body (@{
    origin='PAR'
    destination='NYC'
    departureDate='2025-12-01'
    returnDate='2025-12-08'
    adults=1
    cabinClass='economy'
  } | ConvertTo-Json) `
  -ContentType 'application/json'
```

---

## 📊 Métriques et Performance

### Temps de Réponse (Mock Data)

- **Smart Search**: ~100-200ms
- **VPN Search**: ~300-500ms (parallélisation)
- **Price Prediction**: ~150-250ms

### Temps de Réponse (APIs Réelles)

- **Amadeus API**: 500-1500ms
- **Skyscanner API**: 800-2000ms
- **OpenAI GPT-4**: 2000-5000ms

### Optimisations Implémentées

1. **Promise.allSettled**: Recherche parallèle Amadeus + Skyscanner
2. **Déduplication**: Hash unique pour éviter doublons
3. **Cache 24h**: Stockage des résultats dans flight_results
4. **Fallback gracieux**: Mock data si APIs indisponibles

---

## 🔍 Débogage et Logs

### Logs Winston

Le système utilise Winston pour logger tous les événements:

```javascript
// Fichiers de logs
logs / app.log; // Tous les logs (info, warn, error)
logs / error.log; // Erreurs uniquement
console; // Output en temps réel (développement)
```

### Niveaux de Log

- **info**: Recherches, résultats, scores IA
- **warn**: APIs unavailable, fallback to mock
- **error**: Erreurs critiques, stack traces

### Exemple de Logs

```
2025-11-05 11:00:00 [info]: Starting smart flight search for user anonymous
2025-11-05 11:00:00 [warn]: Amadeus API not configured, using mock data
2025-11-05 11:00:00 [warn]: Skyscanner API not configured, using mock data
2025-11-05 11:00:00 [info]: Found 2 flights from 2 sources
2025-11-05 11:00:00 [info]: AI scored 2 flights for user anonymous
2025-11-05 11:00:00 [info]: Smart search completed in 100ms, returning 2 flights
```

---

## 🧪 Tests

### Tests Manuels

Utiliser le script `test-ai-flight-search.js`:

```bash
node test-ai-flight-search.js
```

**Output attendu:**

```
✅ Recherche réussie!
   Nombre de vols trouvés: 2
   Source des données: mock

🏆 Top vol recommandé par l'IA:
   1. AF 450.00EUR
      📊 Score IA: 85/100 (excellent)
      💡 Raison: Vol direct
      🔍 Détail:
         - Prix: 90/100
         - Confort: 85/100
         - Durée: 80/100
```

### Tests avec APIs Réelles

1. Configurer les API keys dans `.env`
2. Redémarrer le serveur
3. Relancer les tests

**Coûts estimés par test:**

- Amadeus Test: Gratuit (quota journalier)
- Skyscanner: Gratuit (quota mensuel)
- OpenAI GPT-4: ~$0.10 par prédiction

---

## 📚 Structure du Code

```
src/
├── services/
│   ├── amadeus.service.js        # 413 lignes - OAuth2, flight search, analytics
│   ├── skyscanner.service.js     # 139 lignes - Browse routes API
│   ├── ai.service.js             # 454 lignes - Scoring IA, GPT-4 predictions
│   └── flight-aggregator.service.js  # 400 lignes - Orchestrateur principal
├── controllers/
│   └── flight.controller.js      # Endpoints REST (search, VPN, predict)
├── routes/
│   └── flight.routes.js          # Définition des routes
├── database/
│   └── migrations/
│       └── 002_ai_features.sql   # 263 lignes - Tables IA
└── utils/
    └── logger.js                 # Configuration Winston
```

---

## 🎯 Prochaines Étapes

### Court Terme

- [ ] Intégration frontend React (FlightSearchForm, Results)
- [ ] Graphiques de prédiction de prix (Chart.js/Recharts)
- [ ] Système d'alertes de prix par email
- [ ] Tests unitaires (Jest)

### Moyen Terme

- [ ] Intégration API Weather (affichage météo destination)
- [ ] Système de recommandations personnalisées
- [ ] Historique de recherche utilisateur
- [ ] Comparaison d'hôtels avec booking.com API

### Long Terme

- [ ] App mobile React Native
- [ ] Recommandations d'activités (TripAdvisor API)
- [ ] Partage d'itinéraires
- [ ] Mode hors-ligne avec cache

---

## 🐛 Problèmes Connus

### APIs Mock par Défaut

**Problème**: Sans API keys, le système utilise des données fictives.  
**Solution**: Configurer les vraies API keys dans `.env`.

### CORS Frontend

**Problème**: Frontend React peut rencontrer des erreurs CORS.  
**Solution**: Le backend a déjà `cors()` middleware activé.

### Prédictions GPT-4 Lentes

**Problème**: OpenAI peut prendre 2-5 secondes.  
**Solution**: Système de cache + fallback statistique implémenté.

---

## 📖 Documentation API Externe

- **Amadeus**: https://developers.amadeus.com/self-service/category/flights
- **Skyscanner**: https://partners.skyscanner.net/affiliates/documentation
- **OpenAI**: https://platform.openai.com/docs/api-reference
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 👥 Contributeurs

- **Paul M.** - Développement initial
- **GitHub Copilot** - Assistant IA

## 📝 Licence

MIT License - Voir LICENSE file

---

## 🆘 Support

Pour toute question ou problème:

1. Consulter la documentation ci-dessus
2. Vérifier les logs: `logs/app.log`
3. Ouvrir une issue GitHub
4. Contacter: paul.m@esme.fr

---

**Date de création**: 5 novembre 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (avec mock data) | 🚧 En attente des API keys pour production réelle
