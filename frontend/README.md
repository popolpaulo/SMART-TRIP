# SMART TRIP - Frontend

Interface utilisateur React pour le comparateur de vols SMART TRIP.

## 🚀 Technologies

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

## ⚡ Démarrage rapide

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:5173**

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.jsx       # Layout principal avec header/footer
│   │   ├── FlightSearchForm.jsx
│   │   ├── TrendingDestinations.jsx
│   │   └── FeaturesSection.jsx
│   ├── pages/              # Pages de l'application
│   │   ├── HomePage.jsx    # Page d'accueil
│   │   └── SearchResultsPage.jsx
│   ├── App.jsx             # Composant principal
│   ├── main.jsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── public/                 # Assets statiques
├── index.html             # Template HTML
├── vite.config.js         # Configuration Vite
├── tailwind.config.js     # Configuration Tailwind
└── package.json
```

## 🎨 Pages disponibles

### 1. Page d'accueil (`/`)
- **Formulaire de recherche** de vols avec :
  - Sélection aller simple / aller-retour / multi-destinations
  - Origine et destination
  - Dates de voyage
  - Nombre de passagers et classe
  - Options (vols directs, aéroports voisins)
- **Destinations tendances** chargées depuis l'API
- **Section fonctionnalités** (IA, alertes prix, VPN, etc.)
- **Call-to-action** pour créer un compte

### 2. Page de résultats (`/search`)
- Affichage des vols trouvés
- Filtres (prix, escales, compagnies)
- Tri des résultats
- Carte de vol avec détails

## 🔌 Connexion à l'API

Le frontend est configuré pour se connecter au backend sur `http://localhost:3000`.

La configuration du proxy Vite redirige automatiquement les requêtes `/api/*` vers le backend.

## 🎯 Fonctionnalités implémentées

- ✅ Design moderne et responsive
- ✅ Formulaire de recherche de vols complet
- ✅ Chargement des destinations tendances depuis l'API
- ✅ Page de résultats de recherche
- ✅ Filtres et tri
- ✅ Interface utilisateur intuitive
- ✅ Animations et transitions fluides

## 🚧 À développer

- [ ] Authentification utilisateur
- [ ] Intégration API de recherche de vols réels
- [ ] Système de réservation
- [ ] Page de profil utilisateur
- [ ] Gestion des alertes de prix
- [ ] Mes voyages
- [ ] Paiement
- [ ] Responsive mobile optimisé

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `tailwind.config.js` :

```js
colors: {
  primary: {...},  // Bleu
  accent: {...}    // Orange
}
```

### Styles globaux

Les styles globaux et les classes utilitaires sont dans `src/index.css`.

## 📱 Responsive

L'application est entièrement responsive :
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

## 🔗 Liens utiles

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

**Bon développement ! 🚀**
