# 🚨 Instructions pour Démarrer SMART TRIP (Collègue)

## ❌ Problème Identifié dans Ton Terminal

D'après les logs, tu as **trois problèmes** :

1. **Tu n'as pas la dernière version du script** (celle avec auto-installation)
2. **Les dépendances npm ne sont pas installées** (erreur `MODULE_NOT_FOUND` pour `openai`)
3. **Chemin avec espaces** : `JavaScript Project` (le nouveau script gère ça automatiquement)

## 🔍 Diagnostic Rapide (30 secondes)

**AVANT TOUT**, lance ce fichier pour vérifier ta configuration :

👉 **Double-clique sur `CHECK-SETUP.bat`**

Ce script va te dire **exactement** ce qui manque sur ton poste !

## ✅ Solution Complète (5 minutes)

### Étape 1️⃣ : Récupérer la Dernière Version

Ouvre **PowerShell** dans ton dossier `SMART-TRIP` et tape :

```powershell
git pull origin main
```

Tu devrais voir :

```
Updating 70fe4af..c4377bc
Fast-forward
 STARTUP_SCRIPT_IMPROVEMENTS.md | 610 +++++++++++++++++++++++++++++++
 start-all.ps1                   | 475 +++++++++++++++--------
 2 files changed, 610 insertions(+), 135 deletions(-)
```

### Étape 2️⃣ : Vérifier la Version du Script

Ouvre le fichier `start-all.ps1` et vérifie que la **ligne 5** contient :

```powershell
#   Version: 2.0 - Auto-installation
```

Si tu vois cette ligne, c'est bon ! Sinon, refais `git pull`.

### Étape 3️⃣ : Lancer le Nouveau Script

Maintenant, double-clique simplement sur **START-ALL.bat**.

Le nouveau script va automatiquement :

- ✅ Vérifier que Node.js est installé
- ✅ **Installer automatiquement les dépendances npm** (backend ET frontend)
- ✅ Démarrer Docker si nécessaire
- ✅ Créer le fichier `.env` par défaut
- ✅ Démarrer PostgreSQL
- ✅ Démarrer Backend et Frontend

### Étape 4️⃣ : Attendre l'Installation (Première Fois)

Tu verras ceci :

```
ETAPE 2/5: Installation des dépendances
------------------------------------------------------------
  Installation des dépendances Backend...
  (ça peut prendre 1-2 minutes)
  [OK] Dépendances Backend installées

  Installation des dépendances Frontend...
  (ça peut prendre 1-2 minutes)
  [OK] Dépendances Frontend installées
```

**C'est normal que ça prenne du temps la première fois !** Laisse faire.

### Étape 5️⃣ : Vérifier que Tout Fonctionne

Une fois terminé, tu verras :

```
============================================================
   SMART TRIP - Système démarré avec succès !
============================================================

Services actifs:
  - PostgreSQL : http://localhost:5433
  - Backend API: http://localhost:3000
  - Frontend   : http://localhost:5173 ou 5174
```

Ouvre ton navigateur sur **http://localhost:5173** et teste la recherche de vols !

## 🔧 Si Tu As Encore des Erreurs

### Erreur "Docker n'est pas démarré"

1. Ouvre **Docker Desktop** manuellement
2. Attends qu'il soit complètement démarré (icône verte)
3. Relance **START-ALL.bat**

### Erreur WSL (Windows Subsystem for Linux)

Si Docker affiche "WSL is unresponsive" :

1. Ouvre **PowerShell en Administrateur**
2. Tape ces commandes **une par une** :
   ```powershell
   wsl --shutdown
   wsl --update
   ```
3. Redémarre **Docker Desktop**
4. Relance **START-ALL.bat**

### Erreur "Cannot find module 'openai'" ⚠️ IMPORTANT

**C'est exactement ton problème !**

Ça veut dire que `node_modules` existe mais que certains modules critiques sont **manquants ou corrompus**.

**SOLUTION RAPIDE (2 clics) :**

1. **Ferme toutes les fenêtres PowerShell/CMD**
2. **Double-clique sur `REPAIR-DEPENDENCIES.bat`** (NOUVEAU fichier !)
3. Attends 3-5 minutes (il va tout réinstaller proprement)
4. Relance **START-ALL.bat**

**OU solution manuelle :**

```powershell
# Dans le dossier SMART-TRIP
# 1. Supprimer node_modules
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force

# 2. Reinstaller
npm install

# 3. Faire pareil pour le frontend
cd frontend
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force
npm install
cd ..
```

Puis relance **START-ALL.bat**.

## 📞 Contact

Si rien ne fonctionne après ces étapes, envoie-moi :

1. La sortie complète de `git pull origin main`
2. La version de Node.js : `node --version`
3. La version de npm : `npm --version`
4. Une capture d'écran du terminal

## ✅ Checklist Rapide

- [ ] J'ai fait `git pull origin main`
- [ ] Le fichier `start-all.ps1` indique "Version: 2.0" (ligne 5)
- [ ] Docker Desktop est ouvert et démarré
- [ ] J'ai lancé **START-ALL.bat**
- [ ] J'ai attendu la fin de l'installation des dépendances
- [ ] L'application fonctionne sur http://localhost:5173

**Bon courage ! 🚀**
