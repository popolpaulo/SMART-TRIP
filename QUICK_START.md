# 🎯 DÉMARRAGE RAPIDE - 1 CLIC !

## ⚡ Installation initiale (PREMIÈRE FOIS SEULEMENT)

### Méthode 1 : Double-clic sur le fichier (le plus simple)

**Double-cliquez sur :** `SETUP.bat`

C'est tout ! Le script va automatiquement :
1. ✅ Vérifier Node.js et Docker
2. ✅ Installer les dépendances npm
3. ✅ Démarrer PostgreSQL avec Docker
4. ✅ Créer toutes les tables
5. ✅ Insérer les données de test

---

### Méthode 2 : Via VS Code (recommandé pour les développeurs)

1. Appuyez sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
2. Tapez : `Tasks: Run Task`
3. Choisissez : **🚀 Setup complet (première installation)**

---

### Méthode 3 : Ligne de commande PowerShell

```powershell
.\setup.ps1
```

---

## 🚀 Démarrer le serveur (APRÈS L'INSTALLATION)

### 🎯 Option 1 : Démarrer TOUT EN 1 CLIC (Backend + Frontend + Database)

**Double-cliquez sur :** `START-ALL.bat` ⭐ **RECOMMANDÉ**

> Ce script démarre automatiquement :
> - 🗄️ PostgreSQL (Docker)
> - 📡 Backend API (port 3000)
> - 🌐 Frontend Web (port 5173)
> - 🔧 PgAdmin (port 5051)

### Option 2 : Démarrer uniquement le Backend

**Double-cliquez sur :** `START.bat`

### Option 3 : Via VS Code

1. Appuyez sur `Ctrl+Shift+B` (raccourci build par défaut)
   
   **OU**

2. `Ctrl+Shift+P` → `Tasks: Run Task` → **▶️ Démarrer le serveur**

### Option 4 : Ligne de commande

**Pour tout démarrer :**
```powershell
.\start-all.ps1
```

**Uniquement le backend :**
```powershell
.\start.ps1
```

**OU**

```powershell
npm run dev
```

---

## ⏹️ Arrêter les services

### 🎯 Option 1 : Arrêter TOUT (Backend + Frontend + Database)

**Double-cliquez sur :** `STOP-ALL.bat` ⭐ **RECOMMANDÉ**

### Option 2 : Arrêter uniquement Docker (PostgreSQL + PgAdmin)

**Double-cliquez sur :** `STOP.bat`

### Option 3 : Via VS Code

`Tasks: Run Task` → **⏹️ Arrêter les services**

### Option 4 : Ligne de commande

**Pour tout arrêter :**
```powershell
.\stop-all.ps1
```

**Uniquement Docker :**
```powershell
.\stop.ps1
```

---

## 🔄 Réinitialiser complètement

Si vous voulez tout remettre à zéro (supprime la BDD et les données) :

```powershell
.\reset.ps1
```

Puis relancez `SETUP.bat`

---

## 📋 Toutes les tâches disponibles dans VS Code

Appuyez sur `Ctrl+Shift+P` puis `Tasks: Run Task` :

| Tâche | Description |
|-------|-------------|
| 🚀 Setup complet | Installation complète (1ère fois) |
| ▶️ Démarrer le serveur | Lance le serveur en mode dev |
| ⏹️ Arrêter les services | Arrête Docker et le serveur |
| 🔄 Réinitialiser | Remet à zéro l'environnement |
| 📦 Installer dépendances | npm install |
| 🐳 Démarrer Docker | docker-compose up -d |
| 🗄️ Créer les tables | Migration de la BDD |
| 🌱 Données de test | Seed de la BDD |
| 📊 Logs Docker | Voir les logs en temps réel |

---

## ✅ Vérifier que tout fonctionne

Après avoir lancé `START-ALL.bat` :

1. **Ouvrez votre navigateur :**
   - 🌐 **http://localhost:5173** → Interface Web (Frontend) ⭐
   - 📡 **http://localhost:3000** → API principale (Backend)
   - ❤️ **http://localhost:3000/health** → État du serveur
   - 🔧 **http://localhost:5051** → PgAdmin (interface BDD)

2. **Testez une route API :**
   - http://localhost:3000/api/search/trending

---

## 🎯 Raccourcis clavier VS Code

- `Ctrl+Shift+B` → Démarrer le serveur (tâche par défaut)
- `Ctrl+Shift+P` → Ouvrir la palette de commandes
- `Ctrl+J` → Afficher/masquer le terminal

---

## 📝 Utilisateurs de test

Après le setup, ces utilisateurs sont disponibles :

| Email | Password |
|-------|----------|
| test@smarttrip.com | Test123! |
| marie@smarttrip.com | Test123! |
| paul@smarttrip.com | Test123! |

---

## 🆘 Problèmes courants

### "Docker n'est pas démarré"
→ Lancez Docker Desktop manuellement

### "Le port 3000 est déjà utilisé"
→ Modifiez `PORT=3001` dans le fichier `.env`

### "Erreur de connexion à PostgreSQL"
→ Attendez quelques secondes que PostgreSQL démarre, puis réessayez

### Tout réinitialiser
```powershell
.\reset.ps1
.\setup.ps1
```

---

## 👥 Collaboration avec votre binôme

1. **Chacun** lance `SETUP.bat` sur son PC
2. **Vous synchronisez** le code via Git
3. **Chacun** a sa propre base de données locale
4. **Pas de conflits** de données entre vous !

---

## 📚 Documentation utile

- **README.md** : Documentation technique détaillée
- **TEST_API.md** : Exemples prêts à l'emploi pour tester l'API

---

**🎉 Vous êtes prêt à développer ! Bon courage ! 🚀**
