# 📊 Système de Prix Réels pour les Destinations Tendances

## ⚠️ Problème identifié

Les prix affichés dans la section "Destinations populaires" étaient **statiques** et **hardcodés** dans le fichier `seed.js` :

- Paris: 450€ (fixe)
- Tokyo: 800€ (fixe)
- New York: 650€ (fixe)
- etc.

Ces prix **ne venaient PAS** des APIs de vols (Amadeus/Skyscanner) et pouvaient induire les utilisateurs en erreur.

## ✅ Solution implémentée

### 1. Service de mise à jour des prix réels

Fichier : `src/services/trending-price-updater.service.js`

Ce service :

- Récupère les prix réels depuis l'API Amadeus
- Pour chaque destination, recherche les vols depuis Paris (CDG) par défaut
- Calcule le prix minimum et moyen parmi les vols trouvés
- Met à jour la base de données avec les prix réels

### 2. Migration de la base de données

Fichier : `src/database/migrations/003_trending_real_prices.sql`

Ajout de deux nouvelles colonnes :

- `min_price` : Prix minimum trouvé parmi les vols disponibles
- `last_price_update` : Date de dernière mise à jour des prix

### 3. Script de mise à jour manuelle

Fichier : `update-trending-prices.js`

Permet de lancer manuellement la mise à jour des prix.

## 🚀 Utilisation

### Première mise à jour (OBLIGATOIRE après le seed)

1. **Exécuter la migration** :

```bash
npm run db:migrate
```

2. **Lancer la mise à jour des prix** :

```bash
node update-trending-prices.js
```

Résultat :

```
🚀 Démarrage de la mise à jour des prix des destinations
📍 Aéroport d'origine: CDG
============================================================
🔍 Recherche de vols CDG → LIS...
✅ Lisbonne: 89€ - 134€ (8 vols)
🔍 Recherche de vols CDG → JFK...
✅ New York: 387€ - 512€ (10 vols)
...
============================================================
📊 RÉSULTATS DE LA MISE À JOUR
✅ Destinations mises à jour: 6/6
❌ Erreurs: 0
📈 Taux de succès: 100.0%
============================================================
```

### Mise à jour depuis un autre aéroport

Si vous voulez afficher les prix depuis New York au lieu de Paris :

```bash
node update-trending-prices.js JFK
```

### Automatisation (RECOMMANDÉ)

#### Option 1: Cron Job (Linux/Mac)

Ajouter dans votre crontab (`crontab -e`) :

```cron
# Mise à jour quotidienne à 2h du matin
0 2 * * * cd /path/to/SMART-TRIP && node update-trending-prices.js >> logs/price-update.log 2>&1
```

#### Option 2: Task Scheduler (Windows)

1. Ouvrir le Planificateur de tâches Windows
2. Créer une nouvelle tâche
3. Déclencheur : Tous les jours à 2h00
4. Action : Démarrer `node.exe`
5. Arguments : `update-trending-prices.js`
6. Répertoire de démarrage : `C:\path\to\SMART-TRIP`

#### Option 3: Node-cron (dans l'application)

Ajouter dans `server.js` :

```javascript
const cron = require("node-cron");
const trendingPriceUpdater = require("./src/services/trending-price-updater.service");

// Mise à jour quotidienne à 2h du matin
cron.schedule("0 2 * * *", async () => {
  logger.info("🔄 Lancement automatique de la mise à jour des prix...");
  await trendingPriceUpdater.updateAllPrices("CDG");
});
```

Installer node-cron :

```bash
npm install node-cron
```

## 📱 Affichage frontend

Le composant `TrendingDestinations.jsx` a été modifié pour :

1. **Afficher le prix minimum** en priorité (prix le plus bas trouvé)
2. **Afficher un disclaimer** "Prix indicatif" si les prix n'ont pas encore été mis à jour
3. **Gérer gracieusement** l'absence de données réelles

Exemple d'affichage :

```
À partir de
89€ / pers           ← Prix réel depuis l'API
```

Si pas encore mis à jour :

```
À partir de
450€ / pers
Prix indicatif       ← Warning affiché en orange
```

## 🏗️ Architecture

```
User visite HomePage
       ↓
TrendingDestinations.jsx affiche destinations
       ↓
API GET /api/search/trending
       ↓
search.controller.js query DB
       ↓
SELECT * FROM trending_destinations
       ↓
Affichage min_price (prix réel) ou average_price (prix seed)


Mise à jour quotidienne (cron):
       ↓
node update-trending-prices.js
       ↓
trending-price-updater.service.js
       ↓
Pour chaque destination:
  - searchFlights() via Amadeus API
  - Calculer min(prices) et avg(prices)
  - UPDATE trending_destinations SET min_price, average_price
       ↓
DB mise à jour avec prix réels
```

## ⚡ Optimisations

### 1. Cache des prix

Pour éviter trop d'appels API, les prix sont mis à jour seulement 1x par jour.

### 2. Limites API

Le script fait une pause de 2 secondes entre chaque destination pour ne pas dépasser les limites de l'API Amadeus (free tier: 10 requêtes/seconde).

### 3. Gestion des erreurs

Si une destination échoue, le script continue avec les autres au lieu de tout stopper.

## 📋 Checklist après installation

- [ ] Exécuter la migration : `npm run db:migrate`
- [ ] Lancer la première mise à jour : `node update-trending-prices.js`
- [ ] Vérifier que les prix ont changé dans la page d'accueil
- [ ] Configurer le cron job pour automatisation quotidienne
- [ ] Monitorer les logs de mise à jour

## 🔍 Vérification manuelle

Pour vérifier que les prix sont à jour dans la base de données :

```sql
SELECT
  city,
  average_price,
  min_price,
  last_price_update,
  CASE
    WHEN last_price_update IS NULL THEN 'Prix non mis à jour (seed)'
    WHEN last_price_update < NOW() - INTERVAL '2 days' THEN 'Prix obsolète (>2 jours)'
    ELSE 'Prix à jour'
  END as status
FROM trending_destinations
ORDER BY last_price_update DESC NULLS LAST;
```

## 🆘 Troubleshooting

### "Aucun vol trouvé"

- Vérifier que votre clé API Amadeus est valide
- Vérifier les codes aéroports dans `getCityAirport()`
- Essayer avec des dates plus éloignées (14 jours par défaut)

### "Quota API dépassé"

- Attendre la réinitialisation du quota (minuit UTC)
- Réduire le nombre de destinations
- Espacer davantage les requêtes (augmenter le sleep)

### Prix toujours "indicatif"

- Vérifier que `update-trending-prices.js` a été exécuté avec succès
- Vérifier les logs : `tail -f logs/combined.log`
- Exécuter manuellement et regarder la console

## 📚 Ressources

- [Documentation API Amadeus](https://developers.amadeus.com/self-service/category/flights)
- [node-cron documentation](https://www.npmjs.com/package/node-cron)
- Migration SQL : `src/database/migrations/003_trending_real_prices.sql`
- Service updater : `src/services/trending-price-updater.service.js`
