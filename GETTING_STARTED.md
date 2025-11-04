# Guide de démarrage rapide - SMART TRIP

## 🚀 Installation rapide (5 minutes)

### 1. Installer les dépendances Node.js

```powershell
npm install
```

### 2. Copier le fichier de configuration

```powershell
Copy-Item .env.example .env
```

### 3. Démarrer la base de données PostgreSQL

**Avec Docker (recommandé)** :
```powershell
docker-compose up -d
```

**Sans Docker** : Installez PostgreSQL 15 manuellement et créez une base `smarttrip_dev`.

### 4. Créer les tables de la base de données

```powershell
npm run db:migrate
```

### 5. Insérer des données de test

```powershell
npm run db:seed
```

### 6. Démarrer le serveur

```powershell
npm run dev
```

Le serveur est accessible sur : **http://localhost:3000**

## ✅ Vérifier que tout fonctionne

Ouvrez votre navigateur et allez sur :
- http://localhost:3000 - Page d'accueil de l'API
- http://localhost:3000/health - État du serveur

## 🧪 Tester l'API

### Test d'inscription (PowerShell)

```powershell
$body = @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "Jean"
    lastName = "Dupont"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/register -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### Test de connexion

```powershell
$body = @{
    email = "test@smarttrip.com"
    password = "Test123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### Obtenir les destinations tendances

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/search/trending -Method GET
```

## 📊 Accéder à la base de données

### Via PgAdmin (Interface graphique)

1. Ouvrez http://localhost:5050
2. Connectez-vous :
   - Email: `admin@smarttrip.com`
   - Password: `admin`
3. Ajoutez un serveur :
   - Host: `postgres` (ou `localhost` si PgAdmin local)
   - Port: `5432`
   - Database: `smarttrip_dev`
   - Username: `smarttrip_user`
   - Password: `smarttrip_password`

### Via ligne de commande

```powershell
docker exec -it smarttrip_db psql -U smarttrip_user -d smarttrip_dev
```

Commandes SQL utiles :
```sql
-- Lister les tables
\dt

-- Voir les utilisateurs
SELECT * FROM users;

-- Voir les destinations tendances
SELECT * FROM trending_destinations;

-- Quitter
\q
```

## 🤝 Collaboration à deux

### Configuration Git

```bash
# Configurer votre identité Git (si pas encore fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Créer une branche pour travailler
git checkout -b feature/ma-fonctionnalite

# Faire vos modifications...

# Commit
git add .
git commit -m "Description de vos changements"

# Pousser vers GitHub
git push origin feature/ma-fonctionnalite
```

### Workflow recommandé

1. **Personne A** travaille sur le frontend
2. **Personne B** travaille sur le backend
3. Chacun a sa propre base de données locale via Docker
4. Synchronisation du code via Git/GitHub
5. Pull Requests pour review mutuelle

## 🔧 Commandes utiles

```powershell
# Démarrer le serveur en mode dev (auto-reload)
npm run dev

# Arrêter Docker
docker-compose down

# Voir les logs Docker
docker-compose logs -f postgres

# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d
npm run db:migrate
npm run db:seed

# Installer une nouvelle dépendance
npm install nom-du-package
```

## 📝 Structure des dossiers pour votre travail

```
SMART-TRIP/
├── src/
│   ├── controllers/    👈 Logique métier (ajoutez vos traitements ici)
│   ├── routes/         👈 Définition des endpoints API
│   ├── database/       👈 Schéma et migrations BDD
│   └── utils/          👈 Fonctions utilitaires
├── frontend/           👈 À créer pour votre interface (React, Vue, etc.)
├── .env               👈 Configuration locale (ne pas commit)
└── server.js          👈 Point d'entrée du serveur
```

## 🎯 Prochaines tâches suggérées

### Backend
- [ ] Intégrer une vraie API de vols (Amadeus, etc.)
- [ ] Implémenter l'IA pour les recommandations
- [ ] Ajouter la recherche VPN multi-pays
- [ ] Système de cache Redis pour les recherches
- [ ] Websockets pour les notifications temps réel

### Frontend
- [ ] Créer l'interface de recherche de vols
- [ ] Page de profil utilisateur
- [ ] Dashboard des voyages planifiés
- [ ] Système d'alertes de prix
- [ ] Chat avec assistant IA

## ❓ Questions fréquentes

**Q: Comment arrêter tout ?**
```powershell
# Arrêter le serveur : Ctrl+C dans le terminal
# Arrêter Docker :
docker-compose down
```

**Q: La base de données ne démarre pas ?**
- Vérifiez que Docker Desktop est lancé
- Vérifiez que le port 5432 n'est pas déjà utilisé
- Consultez les logs : `docker-compose logs postgres`

**Q: Erreur "Cannot find module" ?**
```powershell
npm install
```

**Q: Comment réinitialiser tout ?**
```powershell
docker-compose down -v
npm run db:migrate
npm run db:seed
```

## 📚 Ressources

- [Documentation Express.js](https://expressjs.com/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation JWT](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Besoin d'aide ?** Créez une issue sur GitHub ou contactez votre binôme !
