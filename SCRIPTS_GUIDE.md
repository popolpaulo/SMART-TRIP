# 🎯 Scripts de Démarrage Rapide

## ✅ Réponse à ta question : **OUI !**

**Tu peux maintenant démarrer le backend ET le frontend en 1 seul clic !**

---

## 📁 Fichiers à ta disposition

### 🚀 Démarrage

| Fichier | Description | Ce qu'il lance |
|---------|-------------|----------------|
| **START-ALL.bat** ⭐ | **Démarre TOUT** | Backend + Frontend + Database |
| START.bat | Démarre le backend uniquement | Backend + Database |

### ⏹️ Arrêt

| Fichier | Description | Ce qu'il arrête |
|---------|-------------|-----------------|
| **STOP-ALL.bat** ⭐ | **Arrête TOUT** | Backend + Frontend + Database |
| STOP.bat | Arrête Docker uniquement | Database (PostgreSQL + PgAdmin) |

### 🔧 Installation et Maintenance

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| SETUP.bat | Installation complète | Première fois ou après un reset |
| **REPAIR-DEPENDENCIES.bat** 🆕 | Répare les modules npm | Si erreur "Cannot find module" |
| CHECK-SETUP.bat 🆕 | Diagnostic de configuration | Avant de demander de l'aide |
| reset.ps1 | Réinitialisation totale | Pour repartir de zéro |

---

## 🎮 Comment l'utiliser ?

### 1️⃣ Première installation (une seule fois)

**Double-clique sur :** `SETUP.bat`

Attends que tout s'installe (~2-3 minutes)

---

### 2️⃣ Démarrage quotidien (à chaque session de dev)

**Double-clique sur :** `START-ALL.bat`

Attends 5-10 secondes, puis ouvre ton navigateur :
- 🌐 Frontend : **http://localhost:5173**
- 📡 Backend API : **http://localhost:3000**

---

### 3️⃣ Arrêt (en fin de session)

**Double-clique sur :** `STOP-ALL.bat`

Tous les services s'arrêtent proprement !

---

## 🖥️ Ce qui se passe quand tu lances START-ALL.bat

```
✓ Vérification de Docker...
  [OK] Docker est démarré

✓ Vérification de PostgreSQL...
  [OK] PostgreSQL est prêt (port 5433)

➜ Démarrage du Backend...
  [OK] Backend démarré (Job ID: 1)

➜ Démarrage du Frontend...
  [OK] Frontend démarré (Job ID: 2)

============================================================
   🚀 SMART TRIP est maintenant en cours d'exécution !
============================================================

  📡 Backend API     : http://localhost:3000
  🌐 Frontend Web    : http://localhost:5173
  🗄️  PostgreSQL     : localhost:5433
  🔧 PgAdmin         : http://localhost:5051

============================================================
  ⚠️  Appuyez sur Ctrl+C pour arrêter tous les serveurs
============================================================

📋 Logs en temps réel :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[BACKEND]  Server running on http://localhost:3000
[FRONTEND] VITE v5.4.21 ready in 823 ms
[FRONTEND] ➜  Local:   http://localhost:5173/
```

---

## 🎯 Workflow recommandé

### Chaque jour quand tu arrives :

1. 🖱️ Double-clic sur `START-ALL.bat`
2. ⏳ Attends 10 secondes
3. 🌐 Ouvre http://localhost:5173
4. 💻 Code tranquillement !

### Chaque jour quand tu pars :

1. 🖱️ Double-clic sur `STOP-ALL.bat`
2. ✅ C'est tout !

---

## 🔥 Avantages

✅ **1 seul clic** au lieu de taper 3 commandes  
✅ **Automatique** : vérifie Docker, attend que PostgreSQL soit prêt  
✅ **Logs en temps réel** : vois ce qui se passe dans le backend ET le frontend  
✅ **Arrêt propre** : Ctrl+C ou STOP-ALL.bat arrête tout proprement  
✅ **Partage avec ton binôme** : il a les mêmes scripts !  

---

## 💡 Astuce

Si tu veux **voir les logs séparément** :

1. Ouvre 2 terminaux PowerShell
2. Dans le premier : `npm run dev` (backend)
3. Dans le second : `cd frontend; npm run dev` (frontend)

Mais c'est **moins pratique** que START-ALL.bat ! 😉

---

## 🆘 Problèmes ?

### Le script ne démarre pas
→ Vérifie que Docker Desktop est lancé

### "Port déjà utilisé"
→ Lance `STOP-ALL.bat` d'abord

### ⚠️ "Cannot find module 'openai'" ou autre module
→ **Double-clique sur `REPAIR-DEPENDENCIES.bat`** (2-3 minutes)  
→ Puis relance `START-ALL.bat`

### Frontend ne se connecte pas au backend
→ Attends 5 secondes après le démarrage que le backend soit prêt

### Je ne sais pas ce qui manque sur mon poste
→ **Lance `CHECK-SETUP.bat`** pour un diagnostic complet

### Tout casser et recommencer
```powershell
.\reset.ps1
.\SETUP.bat
.\START-ALL.bat
```

---

**🎉 Maintenant tu peux dev en 1 clic ! Enjoy ! 🚀**
