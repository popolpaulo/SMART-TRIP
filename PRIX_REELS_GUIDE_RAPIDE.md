# 🎯 GUIDE RAPIDE - Mise à jour des Prix Réels

## ❌ Problème

Les prix "Destinations populaires" étaient **STATIQUES** (hardcodés dans seed.js) :

- ❌ Paris : 450€ (fixe)
- ❌ Tokyo : 800€ (fixe)
- ❌ New York : 650€ (fixe)

**Ils ne venaient PAS des APIs de vols réelles !**

---

## ✅ Solution

Système automatique qui récupère les **vrais prix** depuis l'API Amadeus.

---

## 🚀 Installation en 3 étapes

### 1️⃣ Exécuter la migration SQL

```bash
npm run db:migrate
```

→ Ajoute les colonnes `min_price` et `last_price_update`

### 2️⃣ Mettre à jour les prix réels

```bash
npm run prices:update
```

Ou :

```bash
node update-trending-prices.js
```

→ Récupère les vrais prix depuis Amadeus pour chaque destination

### 3️⃣ Vérifier dans l'interface

Ouvrir `http://localhost:5174` et regarder la section **"Destinations populaires"**

✅ Les prix sont maintenant **réels** !

---

## 📊 Ce que fait le script

Pour chaque destination (Paris, Tokyo, New York, etc.) :

1. 🔍 Recherche des vols depuis Paris (CDG) pour dans 2 semaines
2. 💰 Trouve le prix minimum parmi tous les vols
3. 📊 Calcule le prix moyen
4. 💾 Met à jour la base de données

**Exemple de sortie :**

```
🔍 Recherche de vols CDG → LIS...
✅ Lisbonne: 89€ - 134€ (8 vols)

🔍 Recherche de vols CDG → JFK...
✅ New York: 387€ - 512€ (10 vols)

📊 RÉSULTATS :
✅ 6/6 destinations mises à jour
```

---

## ⏰ Automatisation (RECOMMANDÉ)

Pour que les prix restent à jour, configurez un **cron job quotidien**.

### 🚀 Installation automatique en 1 clic !

**Clic droit** sur `INSTALL-CRON-JOB.bat` > **"Exécuter en tant qu'administrateur"**

Ce script va automatiquement :

- ✅ Créer la tâche planifiée Windows
- ✅ Configurer l'exécution quotidienne à 2h00
- ✅ Tester la tâche immédiatement
- ✅ Créer les logs automatiques

**C'est tout !** Les prix seront mis à jour automatiquement tous les jours.

### 📊 Gérer la tâche planifiée

Double-cliquez sur `MANAGE-CRON-JOB.bat` pour :

- ▶️ Lancer la mise à jour maintenant
- ⏸️ Désactiver/activer la tâche
- 📊 Voir les logs d'exécution
- 🗑️ Supprimer la tâche

### Option manuelle : Task Scheduler Windows

Si vous préférez configurer manuellement :

1. Ouvrir le **Planificateur de tâches**
2. Créer une tâche basique :
   - Nom : "SMART-TRIP-UpdatePrices"
   - Déclencheur : **Tous les jours à 2h00**
   - Action : Démarrer un programme
     - Programme : `powershell.exe`
     - Arguments : `-ExecutionPolicy Bypass -File "C:\Users\paulm\OneDrive - ESME\Documents\ESME\Ingé A2 MSI\SMART-TRIP\scheduled-price-update.ps1"`

---

## 🔄 Mise à jour manuelle

Quand vous voulez mettre à jour les prix immédiatement :

```bash
npm run prices:update
```

**Depuis un autre aéroport (ex: New York) :**

```bash
node update-trending-prices.js JFK
```

---

## 🎨 Interface utilisateur

Le composant `TrendingDestinations.jsx` affiche maintenant :

**Si prix à jour :**

```
À partir de
89€ / pers
```

**Si pas encore mis à jour :**

```
À partir de
450€ / pers
Prix indicatif  ← Warning orange
```

---

## ✅ Checklist finale

- [ ] `npm run db:migrate` exécuté
- [ ] `npm run prices:update` exécuté avec succès
- [ ] Prix changés dans l'interface (F5 pour rafraîchir)
- [ ] Cron job configuré pour mise à jour quotidienne
- [ ] Documentation lue : `TRENDING_PRICES_REAL_API.md`

---

## 📝 Commandes utiles

```bash
# Mettre à jour les prix
npm run prices:update

# Voir les prix en base de données
docker exec -it smart-trip-postgres psql -U postgres -d smarttrip -c "SELECT city, min_price, average_price, last_price_update FROM trending_destinations;"

# Voir les logs
Get-Content logs/combined.log -Tail 50

# Reset complet (seed + prix)
npm run db:seed
npm run prices:update
```

---

## 🆘 Problèmes fréquents

### "Cannot find module 'dotenv'"

```bash
npm install
```

### "Amadeus API error"

- Vérifier `.env` → `AMADEUS_API_KEY` et `AMADEUS_API_SECRET`
- Vérifier quota API sur https://developers.amadeus.com

### Prices ne changent pas dans l'interface

```bash
# Ctrl+F5 pour forcer le rafraîchissement du cache
# Ou vider le cache du navigateur
```

---

## 📚 Documentation complète

Pour plus de détails, voir : **`TRENDING_PRICES_REAL_API.md`**
