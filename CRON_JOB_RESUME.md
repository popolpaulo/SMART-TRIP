# ✅ Cron Job Automatique - Configuration Terminée

## 🎯 Résumé

Vous avez maintenant un **système automatique** qui met à jour les prix des "Destinations populaires" tous les jours.

---

## 📁 Fichiers créés

### Scripts d'installation et gestion

1. **`INSTALL-CRON-JOB.bat`** ⭐  
   → Clic droit > "Exécuter en tant qu'administrateur"  
   → Installe la tâche planifiée Windows

2. **`MANAGE-CRON-JOB.bat`**  
   → Double-clic pour gérer la tâche  
   → Lancer, arrêter, voir les logs

3. **`install-cron-job.ps1`**  
   → Script PowerShell d'installation

4. **`manage-cron-job.ps1`**  
   → Script PowerShell de gestion

5. **`scheduled-price-update.ps1`**  
   → Script exécuté automatiquement tous les jours

---

## ⏰ Qu'est-ce qui se passe maintenant ?

### Tous les jours à 2h00 du matin :

1. Windows lance automatiquement `scheduled-price-update.ps1`
2. Le script exécute `update-trending-prices.js`
3. Pour chaque destination (Paris, Tokyo, New York, etc.) :
   - 🔍 Recherche les vols via l'API Amadeus
   - 💰 Trouve le prix minimum
   - 💾 Met à jour la base de données
4. Les logs sont écrits dans `logs/price-update.log`

### Résultat :

✅ Les prix affichés sur votre site sont **toujours à jour**  
✅ Aucune intervention manuelle nécessaire  
✅ Historique complet dans les logs

---

## 🔍 Vérifier l'installation

### Méthode 1 : Planificateur de tâches Windows

1. Ouvrir le **Planificateur de tâches** Windows  
   (`Win + R` → `taskschd.msc`)

2. Chercher la tâche : **`SMART-TRIP-UpdatePrices`**

3. Vous devriez voir :
   - ✅ État : Prêt
   - ⏰ Prochaine exécution : Demain à 02:00:00
   - 📅 Déclencheur : Quotidien

### Méthode 2 : PowerShell

```powershell
Get-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"
```

### Méthode 3 : Script de gestion

Double-cliquez sur `MANAGE-CRON-JOB.bat`

---

## 🚀 Tester immédiatement

Vous ne voulez pas attendre 2h00 du matin ? Lancez manuellement :

### Option 1 : Script de gestion

1. Double-cliquer sur `MANAGE-CRON-JOB.bat`
2. Choisir l'option **"1. Exécuter la tâche maintenant"**

### Option 2 : Planificateur de tâches

1. Ouvrir le Planificateur de tâches
2. Clic droit sur `SMART-TRIP-UpdatePrices`
3. Cliquer sur **"Exécuter"**

### Option 3 : PowerShell

```powershell
Start-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"
```

### Option 4 : Commande directe

```bash
npm run prices:update
```

---

## 📊 Voir les logs d'exécution

### Option 1 : Fichier de log

Ouvrir : `logs/price-update.log`

### Option 2 : Script de gestion

1. Double-cliquer sur `MANAGE-CRON-JOB.bat`
2. Choisir **"4. Voir les logs"**

### Option 3 : PowerShell

```powershell
Get-Content ".\logs\price-update.log" -Tail 50
```

### Exemple de log réussi :

```
2025-11-05 02:00:00 - ==========================================
2025-11-05 02:00:00 - Demarrage de la mise a jour des prix
2025-11-05 02:00:00 - ==========================================
2025-11-05 02:00:01 - Repertoire actuel: C:\...\SMART-TRIP
2025-11-05 02:00:01 - Node.js detecte: v18.17.0
2025-11-05 02:00:02 - Execution du script de mise a jour...
2025-11-05 02:00:15 - Recherche de vols CDG → LIS...
2025-11-05 02:00:18 - Lisbonne: 89€ - 134€ (8 vols)
2025-11-05 02:00:21 - Recherche de vols CDG → JFK...
2025-11-05 02:00:25 - New York: 387€ - 512€ (10 vols)
2025-11-05 02:00:45 - Mise a jour terminee avec succes
2025-11-05 02:00:45 - Resultat: 6/6 destinations mises a jour
2025-11-05 02:00:45 - ==========================================
```

---

## 🛠️ Gérer la tâche

### Désactiver temporairement

Si vous voulez mettre en pause (vacances, maintenance, etc.) :

**Option 1 :**

1. Double-cliquer sur `MANAGE-CRON-JOB.bat`
2. Choisir **"2. Désactiver la tâche"**

**Option 2 :**

```powershell
Disable-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"
```

### Réactiver

**Option 1 :**

1. Double-cliquer sur `MANAGE-CRON-JOB.bat`
2. Choisir **"3. Activer la tâche"**

**Option 2 :**

```powershell
Enable-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"
```

### Supprimer complètement

**Option 1 :**

1. Double-cliquer sur `MANAGE-CRON-JOB.bat`
2. Choisir **"5. Supprimer la tâche"**
3. Confirmer avec "oui"

**Option 2 :**

```powershell
Unregister-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices" -Confirm:$false
```

---

## 🔧 Modifier la fréquence

Par défaut : **Tous les jours à 2h00**

Pour changer :

1. Ouvrir le **Planificateur de tâches**
2. Clic droit sur `SMART-TRIP-UpdatePrices` → **Propriétés**
3. Onglet **"Déclencheurs"**
4. Modifier le déclencheur :
   - Quotidien → Hebdomadaire
   - 2h00 → 3h00
   - etc.

---

## ✅ Checklist post-installation

- [ ] Tâche visible dans le Planificateur de tâches Windows
- [ ] État de la tâche : "Prêt" (pas "Désactivé")
- [ ] Prochaine exécution programmée (demain 2h00)
- [ ] Test manuel réussi (Option "Exécuter")
- [ ] Fichier de log créé : `logs/price-update.log`
- [ ] Logs montrent "Mise a jour terminee avec succes"
- [ ] Prix changés dans la page d'accueil (vérifier après test)

---

## 📚 Documentation complète

- **Installation cron job** : `CRON_JOB_INSTALLATION_GUIDE.md`
- **Guide rapide prix réels** : `PRIX_REELS_GUIDE_RAPIDE.md`
- **Documentation technique** : `TRENDING_PRICES_REAL_API.md`
- **Résumé complet** : `PRIX_REELS_RESUME.md`

---

## 🆘 Problèmes courants

### "Accès refusé"

👉 Exécuter `INSTALL-CRON-JOB.bat` en tant qu'administrateur (clic droit)

### Tâche ne s'exécute pas

👉 Vérifier l'état dans le Planificateur de tâches  
👉 Vérifier que la tâche est activée (pas désactivée)  
👉 Vérifier le code de retour de la dernière exécution (0 = succès)

### Pas de logs

👉 Créer le dossier `logs` manuellement :

```bash
mkdir logs
```

### Erreur "Node.js introuvable"

👉 Vérifier que Node.js est dans le PATH système  
👉 Redémarrer Windows après installation de Node.js

### Erreur API Amadeus

👉 Vérifier `.env` → `AMADEUS_API_KEY` et `AMADEUS_API_SECRET`  
👉 Vérifier quota API sur https://developers.amadeus.com

---

## 🎉 Félicitations !

Votre système de **mise à jour automatique des prix** est maintenant opérationnel !

Les prix des "Destinations populaires" seront désormais :

- ✅ **Réels** (depuis l'API Amadeus)
- ✅ **À jour** (actualisés tous les jours)
- ✅ **Automatiques** (aucune intervention manuelle)

**Prochaine mise à jour : Demain à 2h00** 🌙

---

## 📞 Support

Pour toute question ou problème, consultez :

- Les logs : `logs/price-update.log`
- La documentation : `CRON_JOB_INSTALLATION_GUIDE.md`
- Le script de gestion : `MANAGE-CRON-JOB.bat`
