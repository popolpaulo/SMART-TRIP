# ⚡ Guide Rapide : Passer de MOCK à VRAIES DONNÉES

## 🎯 Objectif

Configurer les API keys pour obtenir de **vraies données de vols** au lieu des données fictives.

---

## ✅ Étape 1 : Amadeus API (5 minutes) - **OBLIGATOIRE**

### A) Créer un compte

1. Ouvrir https://developers.amadeus.com/register
2. Remplir le formulaire et valider votre email

### B) Créer une application

1. Se connecter sur https://developers.amadeus.com/my-apps
2. Cliquer **"Create new app"**
3. Nom: `SMART-TRIP`
4. Choisir **"Self-Service"** → **"Test"** (gratuit)

### C) Copier les clés

Vous verrez :

```
API Key:    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API Secret: yyyyyyyyyyyyyyyyyyyy
```

**Copier ces 2 valeurs !**

### D) Configurer

1. Ouvrir le fichier `.env` à la racine
2. Remplacer :

```env
AMADEUS_API_KEY=collez_votre_api_key_ici
AMADEUS_API_SECRET=collez_votre_api_secret_ici
```

---

## ✅ Étape 2 : OpenAI API (5 minutes) - **RECOMMANDÉ**

### A) Créer un compte

1. Ouvrir https://platform.openai.com/signup
2. S'inscrire (peut utiliser Google)
3. Vérifier email + téléphone (SMS)

### B) Ajouter un moyen de paiement

1. Aller sur https://platform.openai.com/account/billing
2. Ajouter une carte bancaire
3. **Définir une limite** : $10/mois (pour éviter les surprises)

### C) Générer la clé

1. Aller sur https://platform.openai.com/api-keys
2. Cliquer **"+ Create new secret key"**
3. Nom: `SMART-TRIP`
4. **COPIER IMMÉDIATEMENT** (ne sera plus visible !)

### D) Configurer

```env
OPENAI_API_KEY=sk-proj-votre_cle_ici
```

**Coût** : ~3 centimes par prédiction de prix

---

## ⏭️ Étape 3 : Skyscanner API - **OPTIONNEL** (peut ignorer)

Skyscanner est difficile à obtenir pour un projet étudiant. **Vous pouvez le sauter !**

Le système fonctionne très bien avec **Amadeus seul**.

Si vous voulez quand même :

- S'inscrire sur https://partners.skyscanner.net/sign-up
- Attendre l'approbation (3-7 jours, souvent refusé)

---

## 🚀 Étape 4 : Tester

### 1. Vérifier la configuration

```bash
node check-api-config.js
```

Vous devriez voir :

```
✅ CONNEXION RÉUSSIE !
   Token reçu: ...
```

### 2. Redémarrer le serveur

```bash
STOP.bat
START.bat
```

### 3. Tester les endpoints

```bash
node test-ai-flight-search.js
```

**Résultat attendu avec vraies APIs** :

```
✅ Recherche réussie!
   Nombre de vols trouvés: 15
   Source des données: amadeus (réel !)

🏆 Top vol recommandé:
   Air France - 450.50 EUR
   📊 Score IA: 85/100
```

---

## 🎓 Configuration Recommandée pour Projet Étudiant

**MINIMUM** (gratuit, qualité correcte) :

```env
# Amadeus seul
AMADEUS_API_KEY=votre_vraie_cle
AMADEUS_API_SECRET=votre_vrai_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com

# OpenAI désactivé (utilise fallback gratuit)
OPENAI_API_KEY=
AI_PREDICTION_ENABLED=true

# Skyscanner désactivé
SKYSCANNER_API_KEY=
```

**OPTIMAL** (5€/mois, excellente qualité) :

```env
# Amadeus + OpenAI
AMADEUS_API_KEY=votre_vraie_cle
AMADEUS_API_SECRET=votre_vrai_secret
OPENAI_API_KEY=sk-proj-votre_cle
AI_PREDICTION_ENABLED=true
```

---

## 📊 Comparaison

| Config               | Coût     | Qualité Données | Prédictions IA  |
| -------------------- | -------- | --------------- | --------------- |
| **MOCK**             | 0€       | ❌ Fictives     | ⚠️ Basiques     |
| **Amadeus seul**     | 0€       | ✅ Réelles      | ⚠️ Statistiques |
| **Amadeus + OpenAI** | ~5€/mois | ✅ Réelles      | ✅ ML avancé    |

---

## ⚠️ Limites Gratuites

### Amadeus Test

- **2000 requêtes/mois** gratuit
- Données réelles mais limitation géographique
- Parfait pour un projet étudiant

### OpenAI

- Pas de tier gratuit
- $0.03 par requête GPT-4
- Alternative : GPT-3.5 (10x moins cher)

---

## 🆘 Problèmes Courants

### "Invalid API Key"

→ Vérifier que vous avez copié API Key ET Secret (2 valeurs différentes)

### "Still seeing mock data"

→ Redémarrer complètement le serveur après modification du .env

### "Rate limit exceeded"

→ Vous avez dépassé 2000 requêtes ce mois-ci, attendre le reset

### "Insufficient credits" (OpenAI)

→ Ajouter du crédit ou désactiver : `AI_PREDICTION_ENABLED=false`

---

## 📞 Support

- **Documentation complète** : `CONFIGURATION_API_KEYS.md`
- **Vérifier config** : `node check-api-config.js`
- **Tester APIs** : `node test-ai-flight-search.js`
- **Logs** : `type logs\app.log`

---

**Temps total** : ⏱️ 10-15 minutes  
**Difficulté** : 🟢 Facile  
**Résultat** : 🎉 Vraies données de 500+ compagnies aériennes !
