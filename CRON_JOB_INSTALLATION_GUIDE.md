# 🤖 Installation du Cron Job Automatique - Guide Visuel

## 📋 Qu'est-ce qu'un Cron Job ?

Un **cron job** (ou tâche planifiée) est un script qui s'exécute automatiquement à intervalles réguliers.

Dans notre cas : **Mise à jour des prix tous les jours à 2h00 du matin** 🌙

---

## 🚀 Installation en 1 clic (RECOMMANDÉ)

### Étape 1 : Localiser le fichier

Dans votre projet, trouvez le fichier : **`INSTALL-CRON-JOB.bat`**

```
SMART-TRIP/
├── INSTALL-CRON-JOB.bat  ← Ce fichier
├── MANAGE-CRON-JOB.bat
├── scheduled-price-update.ps1
├── install-cron-job.ps1
└── ...
```

### Étape 2 : Clic droit > Exécuter en tant qu'administrateur

```
┌─────────────────────────────────┐
│  INSTALL-CRON-JOB.bat          │
├─────────────────────────────────┤
│  > Ouvrir                       │
│  > Modifier                     │
│  ─────────────────────────      │
│  ⭐ Exécuter en tant qu'admin   │  ← Cliquer ici
│  > Propriétés                   │
└─────────────────────────────────┘
```

### Étape 3 : Accepter les privilèges administrateur

Windows va vous demander :

```
┌────────────────────────────────────────────┐
│  Contrôle de compte d'utilisateur         │
├────────────────────────────────────────────┤
│  Voulez-vous autoriser cette application  │
│  à apporter des modifications à cet       │
│  ordinateur ?                              │
│                                            │
│  Éditeur vérifié : Microsoft Corporation  │
│  Nom du fichier : powershell.exe          │
│                                            │
│        [Oui]              [Non]            │
└────────────────────────────────────────────┘
```

👉 Cliquez sur **"Oui"**

### Étape 4 : Le script s'exécute

Vous verrez :

```
=========================================
   Installation de la tâche planifiée
   Mise à jour automatique des prix
=========================================

📁 Chemin du projet: C:\Users\paulm\...\SMART-TRIP
📄 Script à exécuter: scheduled-price-update.ps1

⏰ Création de la tâche planifiée...
   Nom: SMART-TRIP-UpdatePrices
   Fréquence: Tous les jours à 2h00 du matin
   Utilisateur: SYSTEM (exécution automatique)

✅ Tâche planifiée créée avec succès !

=========================================
   CONFIGURATION DE LA TÂCHE
=========================================

Nom de la tâche : SMART-TRIP-UpdatePrices
Heure d'exécution : Tous les jours à 2h00
Script exécuté : scheduled-price-update.ps1
Fichier de log : C:\...\logs\price-update.log

=========================================
   TEST DE LA TÂCHE
=========================================

Voulez-vous tester la tâche maintenant ? (o/n)
```

### Étape 5 : Tester immédiatement (optionnel)

Tapez **`o`** puis **Entrée** pour tester tout de suite :

```
🚀 Lancement du test...
✅ Tâche lancée !

📊 Consultez le fichier de log pour voir le résultat:
   C:\...\SMART-TRIP\logs\price-update.log

=========================================
   DERNIÈRES LIGNES DU LOG
=========================================
2025-11-05 14:30:15 - ==========================================
2025-11-05 14:30:15 - Démarrage de la mise à jour des prix
2025-11-05 14:30:15 - ==========================================
2025-11-05 14:30:15 - Node.js détecté: v18.17.0
2025-11-05 14:30:15 - Exécution du script de mise à jour...
2025-11-05 14:30:32 - ✅ Mise à jour terminée avec succès
```

### ✅ C'est terminé !

```
=========================================
   INSTALLATION TERMINÉE !
=========================================

✅ Les prix seront mis à jour automatiquement tous les jours à 2h00

Appuyez sur une touche pour continuer...
```

---

## 📊 Gérer la tâche planifiée

Double-cliquez sur **`MANAGE-CRON-JOB.bat`**

```
=========================================
   Gestion Tâche Planifiée SMART TRIP
=========================================

📊 STATUT ACTUEL
   Nom: SMART-TRIP-UpdatePrices
   État: Ready
   Dernière exécution: 2025-11-05 02:00:00
   Résultat: Succès
   Prochaine exécution: 2025-11-06 02:00:00

=========================================
   ACTIONS DISPONIBLES
=========================================

1. ▶️  Exécuter la tâche maintenant
2. ⏸️  Désactiver la tâche
3. ▶️  Activer la tâche
4. 📊 Voir les logs
5. 🗑️  Supprimer la tâche
6. ❌ Quitter

Choisissez une action (1-6):
```

### Actions disponibles

#### 1️⃣ Exécuter maintenant

Lance immédiatement la mise à jour des prix (utile pour tester)

#### 2️⃣ Désactiver

Met la tâche en pause (elle ne s'exécutera plus automatiquement)

#### 3️⃣ Activer

Réactive la tâche si elle était désactivée

#### 4️⃣ Voir les logs

Affiche les logs de la dernière exécution

```
=========================================
   LOGS DE MISE À JOUR DES PRIX
=========================================

Combien de lignes afficher ? (défaut: 50): 20

2025-11-05 02:00:00 - ==========================================
2025-11-05 02:00:00 - Démarrage de la mise à jour des prix
2025-11-05 02:00:00 - ==========================================
2025-11-05 02:00:15 - 🔍 Recherche de vols CDG → LIS...
2025-11-05 02:00:18 - ✅ Lisbonne: 89€ - 134€ (8 vols)
2025-11-05 02:00:21 - 🔍 Recherche de vols CDG → JFK...
2025-11-05 02:00:25 - ✅ New York: 387€ - 512€ (10 vols)
...
```

#### 5️⃣ Supprimer

Supprime complètement la tâche planifiée (demande confirmation)

---

## 🔍 Vérification via le Planificateur de tâches Windows

### Ouvrir le Planificateur de tâches

**Méthode 1 :** Recherche Windows

```
[🔍] Rechercher : "Planificateur de tâches"
```

**Méthode 2 :** Exécuter

```
[Win + R] → taskschd.msc → [Entrée]
```

### Localiser la tâche

```
Planificateur de tâches
├── Bibliothèque du Planificateur de tâches
    └── SMART-TRIP-UpdatePrices  ← Votre tâche
```

### Vue détaillée

```
┌─────────────────────────────────────────────┐
│ SMART-TRIP-UpdatePrices                    │
├─────────────────────────────────────────────┤
│ Général  │ Déclencheurs │ Actions │ ...    │
├─────────────────────────────────────────────┤
│                                             │
│ Nom : SMART-TRIP-UpdatePrices              │
│ Description : Mise à jour automatique      │
│               des prix des destinations    │
│                                             │
│ Déclencheur : Quotidien à 2:00 AM          │
│ Dernière exécution : 2025-11-05 02:00:00   │
│ État : Prêt                                │
│                                             │
└─────────────────────────────────────────────┘
```

### Actions disponibles (clic droit)

```
┌─────────────────────────────┐
│ > Exécuter                  │  ← Lancer immédiatement
│ > Terminer                  │
│ ─────────────────────       │
│ > Désactiver                │  ← Mettre en pause
│ > Exporter                  │
│ ─────────────────────       │
│ > Propriétés                │  ← Modifier les paramètres
│ > Supprimer                 │
└─────────────────────────────┘
```

---

## 📁 Structure des fichiers créés

```
SMART-TRIP/
├── INSTALL-CRON-JOB.bat              ← Installation (Administrateur)
├── MANAGE-CRON-JOB.bat               ← Gestion de la tâche
├── install-cron-job.ps1              ← Script PowerShell d'installation
├── manage-cron-job.ps1               ← Script PowerShell de gestion
├── scheduled-price-update.ps1        ← Script exécuté par la tâche
├── update-trending-prices.js         ← Script Node.js de mise à jour
└── logs/
    └── price-update.log              ← Logs d'exécution automatiques
```

---

## ✅ Checklist finale

- [ ] `INSTALL-CRON-JOB.bat` exécuté en tant qu'administrateur
- [ ] Tâche testée avec succès (option "o" lors de l'installation)
- [ ] Tâche visible dans le Planificateur de tâches Windows
- [ ] Fichier de log créé : `logs/price-update.log`
- [ ] Prochaine exécution programmée pour demain 2h00

---

## 🆘 Problèmes fréquents

### "Accès refusé"

👉 Vous devez exécuter **en tant qu'administrateur** (clic droit)

### "La tâche existe déjà"

👉 Utilisez `MANAGE-CRON-JOB.bat` pour supprimer l'ancienne tâche d'abord

### "PowerShell bloqué par les stratégies d'exécution"

👉 Le script utilise `-ExecutionPolicy Bypass` pour éviter ce problème

### La tâche ne s'exécute pas

👉 Vérifiez dans le Planificateur de tâches :

- État : "Prêt" (pas "Désactivé")
- Dernière exécution : vérifier le code de retour (0 = succès)
- Historique : activer l'historique des tâches dans les paramètres

### Impossible de voir les logs

👉 Vérifiez que le dossier `logs/` existe :

```bash
mkdir logs
```

---

## 🎓 Commandes PowerShell utiles

```powershell
# Lister toutes les tâches planifiées
Get-ScheduledTask

# Voir le statut de la tâche SMART TRIP
Get-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"

# Exécuter la tâche maintenant
Start-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"

# Désactiver la tâche
Disable-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"

# Activer la tâche
Enable-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"

# Supprimer la tâche
Unregister-ScheduledTask -TaskName "SMART-TRIP-UpdatePrices"

# Voir les informations détaillées
Get-ScheduledTaskInfo -TaskName "SMART-TRIP-UpdatePrices"
```

---

## 📚 Ressources

- Script d'installation : `install-cron-job.ps1`
- Script de gestion : `manage-cron-job.ps1`
- Script exécuté : `scheduled-price-update.ps1`
- Logs : `logs/price-update.log`
- Documentation prix réels : `PRIX_REELS_GUIDE_RAPIDE.md`

---

**🎉 Félicitations !** Votre système de mise à jour automatique des prix est configuré ! Les prix seront désormais **toujours à jour** sans intervention manuelle.
