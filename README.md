# SMART TRIP - Backend

Backend Node.js/Express pour la plateforme SMART TRIP - Comparateur de vols et planificateur de voyages intelligent.

## 🚀 Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de données**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Containerisation**: Docker & Docker Compose

## 📋 Prérequis

- Node.js 18+ et npm
- Docker Desktop
- Git

## ⚡ Installation Rapide (Recommandé)

### 🎯 Setup automatique en un clic !

Pour Windows, nous avons créé des scripts d'automatisation :

```bash
# 1. Installation complète (première fois)
.\SETUP.bat

# 2. Démarrer le serveur
.\START.bat

# 3. Arrêter le serveur
.\STOP.bat
```

Le script `SETUP.bat` va automatiquement :

- ✅ Vérifier Node.js et Docker
- ✅ Installer les dépendances npm
- ✅ Créer le fichier `.env`
- ✅ Démarrer PostgreSQL et PgAdmin avec Docker
- ✅ Créer le schéma de base de données
- ✅ Insérer des données de test

**C'est tout ! En 2 minutes, votre environnement est prêt ! 🚀**

### 🔑 Configuration des API Keys (Optionnel)

Par défaut, le système utilise des **données MOCK** pour le développement.

Pour obtenir des **vraies données de vols** :

1. **Guide rapide** : Voir `QUICK_API_SETUP.md` (⏱️ 10 min)
2. **Guide complet** : Voir `CONFIGURATION_API_KEYS.md` (détaillé)

**APIs disponibles** :

- ✅ **Amadeus** (obligatoire) - Vraies données de 500+ compagnies - GRATUIT
- ⚠️ **OpenAI** (recommandé) - Prédictions IA avancées - ~5€/mois
- ❌ **Skyscanner** (optionnel) - Comparaison prix - Difficile à obtenir

**Vérifier la configuration** :

```bash
node check-api-config.js
```

---

## ⚡ Installation Manuelle

### 1. Cloner le repository

```bash
git clone https://github.com/popolpaulo/SMART-TRIP.git
cd SMART-TRIP
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Copiez le fichier `.env.example` en `.env` et modifiez les valeurs selon votre environnement :

```bash
cp .env.example .env
```

**Important** : Modifiez au minimum ces valeurs dans `.env` :

- `JWT_SECRET` : Choisissez une clé secrète complexe
- `DB_PASSWORD` : Changez le mot de passe de la base de données

### 4. Démarrer la base de données avec Docker

La méthode la plus simple pour vous deux est d'utiliser Docker :

```bash
docker-compose up -d
```

Cela démarre :

- PostgreSQL sur le port `5433`
- PgAdmin (interface web) sur `http://localhost:5051`

**Accès PgAdmin** :

- URL: http://localhost:5051
- Email: admin@smarttrip.com
- Mot de passe: admin

### 5. Créer le schéma de base de données

```bash
npm run db:migrate
```

### 6. Insérer des données de test (optionnel)

```bash
npm run db:seed
```

### 6.5. ⭐ **NOUVEAU** - Mettre à jour les prix réels des destinations

**IMPORTANT** : Par défaut, les prix des "Destinations populaires" sont statiques (hardcodés).

Pour afficher les **vrais prix** depuis l'API Amadeus :

```bash
npm run prices:update
```

Cela met à jour les prix pour Paris, Tokyo, New York, etc. avec les **données réelles du marché**.

📖 **Guide détaillé** : Voir `PRIX_REELS_GUIDE_RAPIDE.md`

### 7. Démarrer le serveur

**Mode développement** (avec rechargement automatique) :

```bash
npm run dev
```

**Mode production** :

```bash
npm start
```

Le serveur démarre sur : **http://localhost:3000**

## 📁 Structure du projet

```
SMART-TRIP/
├── src/
│   ├── controllers/      # Logique métier
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── flight.controller.js
│   │   ├── hotel.controller.js
│   │   ├── trip.controller.js
│   │   ├── search.controller.js
│   │   └── alert.controller.js
│   ├── database/         # Gestion BDD
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── middleware/       # Middlewares Express
│   │   ├── auth.middleware.js
│   │   └── validator.middleware.js
│   ├── routes/           # Routes API
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── flight.routes.js
│   │   ├── hotel.routes.js
│   │   ├── trip.routes.js
│   │   ├── search.routes.js
│   │   └── alert.routes.js
│   └── utils/            # Utilitaires
│       └── logger.js
├── logs/                 # Logs applicatifs
├── .env                  # Variables d'environnement (à créer)
├── .env.example          # Exemple de configuration
├── server.js             # Point d'entrée
├── package.json
└── docker-compose.yml    # Configuration Docker
```

## 🔌 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token
- `POST /api/auth/logout` - Déconnexion

### Utilisateur

- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier le profil
- `GET /api/users/preferences` - Préférences de voyage
- `PUT /api/users/preferences` - Modifier les préférences
- `DELETE /api/users/account` - Supprimer le compte

### Vols

- `POST /api/flights/search` - Rechercher des vols
- `GET /api/flights/:id` - Détails d'un vol
- `POST /api/flights/book` - Réserver un vol
- `GET /api/flights/user/searches` - Historique des recherches

### Hôtels

- `POST /api/hotels/search` - Rechercher des hôtels
- `GET /api/hotels/:id` - Détails d'un hôtel
- `POST /api/hotels/book` - Réserver un hôtel

### Voyages

- `GET /api/trips` - Liste des voyages
- `GET /api/trips/:id` - Détails d'un voyage
- `POST /api/trips` - Créer un voyage
- `PUT /api/trips/:id` - Modifier un voyage
- `DELETE /api/trips/:id` - Supprimer un voyage
- `POST /api/trips/:id/activities` - Ajouter une activité
- `DELETE /api/trips/:id/activities/:activityId` - Retirer une activité

### Recherche

- `POST /api/search/global` - Recherche globale
- `GET /api/search/trending` - Destinations tendances
- `POST /api/search/suggestions` - Suggestions IA
- `GET /api/search/autocomplete` - Autocomplétion

### Alertes de prix

- `GET /api/alerts` - Liste des alertes
- `GET /api/alerts/:id` - Détails d'une alerte
- `POST /api/alerts` - Créer une alerte
- `PUT /api/alerts/:id` - Modifier une alerte
- `DELETE /api/alerts/:id` - Supprimer une alerte
- `PATCH /api/alerts/:id/toggle` - Activer/désactiver

## 🧪 Tester l'API

### Avec curl (PowerShell)

**Inscription** :

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/auth/register -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"Test123!","firstName":"Jean","lastName":"Dupont"}'
```

**Connexion** :

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"Test123!"}'
```

### Avec Postman ou Thunder Client

1. Installez l'extension **Thunder Client** dans VS Code
2. Importez les endpoints ci-dessus
3. Testez chaque route

## 👥 Collaboration

### Pour travailler à deux sur le même projet :

#### Méthode 1 : Base de données locale (chacun sa BDD)

- Chaque développeur a sa propre base de données via Docker
- Vous synchronisez le code via Git
- Les données sont locales à chaque machine

#### Méthode 2 : Base de données partagée (recommandé pour débuter)

- Un de vous héberge la BDD et la rend accessible (via tunneling ou serveur cloud)
- Modifier `DB_HOST` dans `.env` pour pointer vers l'IP de l'hôte
- **Attention** : Nécessite une configuration réseau

#### Workflow Git recommandé :

```bash
# Créer une branche pour chaque fonctionnalité
git checkout -b feature/nom-fonctionnalite

# Faire vos modifications
git add .
git commit -m "Description des changements"

# Pousser sur GitHub
git push origin feature/nom-fonctionnalite

# Créer une Pull Request sur GitHub
# L'autre personne review et merge
```

## 📊 Base de données

### Tables principales

- `users` - Utilisateurs
- `user_profiles` - Profils et préférences
- `flight_searches` - Historique des recherches
- `flight_results` - Résultats de vols (cache)
- `flight_bookings` - Réservations de vols
- `hotels` - Hôtels
- `hotel_prices` - Prix des hôtels
- `hotel_bookings` - Réservations d'hôtels
- `trips` - Voyages planifiés
- `trip_activities` - Activités liées aux voyages
- `activities` - Points d'intérêt
- `price_alerts` - Alertes de prix
- `trending_destinations` - Destinations tendances
- `ai_logs` - Logs des interactions IA

### Visualiser la base de données

Utilisez PgAdmin à l'adresse http://localhost:5051 :

1. Connectez-vous avec les identifiants
2. Ajoutez un nouveau serveur :
   - Name: SMART TRIP
   - Host: postgres (ou localhost si PgAdmin n'est pas dans Docker)
   - Port: 5433
   - Database: smarttrip_dev
   - Username: smarttrip_user
   - Password: smarttrip_password

## 🔧 Commandes utiles

### Scripts Windows (Automatisés)

```bash
# Installation complète
.\SETUP.bat

# Démarrer l'environnement
.\START.bat

# Arrêter l'environnement
.\STOP.bat

# Réinitialiser la base de données
.\RESET.bat
```

### Commandes npm

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start

# Créer/mettre à jour le schéma BDD
npm run db:migrate

# Insérer des données de test
npm run db:seed
```

### Commandes Docker

```bash
# Voir les logs Docker
docker-compose logs -f

# Arrêter Docker
docker-compose down

# Redémarrer Docker (et supprimer les données)
docker-compose down -v
docker-compose up -d
```

## 🎯 Prochaines étapes

1. **Intégration des APIs externes** :

   - APIs de vols (Amadeus, Skyscanner, etc.)
   - APIs d'hôtels (Booking.com, Hotels.com, etc.)
   - API météo
   - API VPN pour la géolocalisation

2. **Intelligence Artificielle** :

   - Modèle de recommandation basé sur les préférences
   - Prédiction des prix
   - Analyse des tendances

3. **Frontend** :

   - Développer l'interface utilisateur (React, Vue, ou autre)
   - Intégration avec le backend

4. **Fonctionnalités avancées** :
   - Système de paiement
   - Notifications en temps réel
   - Chat avec assistant IA
   - Optimisation VPN automatique

## 📝 Utilisateurs de test

Après avoir exécuté `npm run db:seed`, vous aurez 3 utilisateurs :

- Email: `test@smarttrip.com` - Password: `Test123!`
- Email: `marie@smarttrip.com` - Password: `Test123!`
- Email: `paul@smarttrip.com` - Password: `Test123!`

## 🐛 Dépannage

### Erreur de connexion à PostgreSQL

- Vérifiez que Docker est démarré : `docker-compose ps`
- Vérifiez les logs : `docker-compose logs postgres`
- Redémarrez : `docker-compose restart postgres`

### Port 3000 déjà utilisé

Changez le port dans `.env` :

```
PORT=3001
```

### Erreur JWT

Vérifiez que `JWT_SECRET` est bien défini dans `.env`

## 📞 Support

Pour toute question, contactez l'équipe SMART TRIP ou créez une issue sur GitHub.

---

**Bon développement ! 🚀✈️**
