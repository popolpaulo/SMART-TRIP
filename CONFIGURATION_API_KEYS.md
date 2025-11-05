# 🔑 Guide de Configuration des API Keys - SMART TRIP

Ce guide vous explique comment obtenir et configurer les clés API nécessaires pour utiliser les **vraies données** au lieu des données MOCK.

---

## 📋 Résumé des APIs Nécessaires

| API             | Obligatoire   | Coût                           | Temps d'obtention | Utilité                   |
| --------------- | ------------- | ------------------------------ | ----------------- | ------------------------- |
| **Amadeus**     | ✅ OUI        | Gratuit (test) / Payant (prod) | 5 min             | Source principale de vols |
| **OpenAI**      | ⚠️ Recommandé | ~$0.03/requête                 | 5 min             | Prédictions IA            |
| **Skyscanner**  | ❌ Optionnel  | Gratuit                        | 3-7 jours         | Comparaison de prix       |
| **VPN Service** | ❌ Optionnel  | Variable                       | -                 | Recherche multi-pays      |

---

## 1️⃣ AMADEUS API (OBLIGATOIRE)

### Pourquoi Amadeus ?

- Base de données de **500+ compagnies aériennes**
- Temps réel, données officielles
- **Gratuit en mode Test** (limité à ~2000 requêtes/mois)

### 📝 Étapes Détaillées

#### A) Créer un compte

1. Aller sur https://developers.amadeus.com/register
2. Remplir le formulaire :
   ```
   First Name: [Votre prénom]
   Last Name: [Votre nom]
   Email: [Votre email]
   Password: [Mot de passe sécurisé]
   Company: ESME (ou votre école)
   ```
3. Accepter les conditions
4. Cliquer sur "Create account"
5. **Vérifier votre email** (cliquer sur le lien reçu)

#### B) Créer une application

1. Se connecter sur https://developers.amadeus.com/my-apps
2. Cliquer sur **"Create new app"**
3. Remplir les informations :
   ```
   Application name: SMART-TRIP
   Application description: Comparateur de vols intelligent avec IA
   ```
4. Sélectionner **"Self-Service"**
5. Choisir l'environnement :
   - **Test** : Gratuit, données réelles mais limitées
   - **Production** : Payant (~€0.002 par requête)

#### C) Récupérer les clés API

Une fois l'app créée, vous verrez sur la page :

```
API Key:    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API Secret: yyyyyyyyyyyyyyyyyyyy
```

**🚨 IMPORTANT** : Ne partagez JAMAIS ces clés publiquement !

#### D) Configurer dans SMART-TRIP

1. Ouvrir le fichier `.env` à la racine du projet
2. Remplacer les valeurs :
   ```env
   AMADEUS_API_KEY=collez_votre_api_key_ici
   AMADEUS_API_SECRET=collez_votre_api_secret_ici
   AMADEUS_BASE_URL=https://test.api.amadeus.com
   ```

#### E) Tester la connexion

```bash
# Redémarrer le serveur
npm start

# Dans un autre terminal, tester
curl http://localhost:3000/api/flights/search -Method POST -Body (@{origin='PAR';destination='NYC';departureDate='2025-12-15';returnDate='2025-12-22';adults=1;cabinClass='economy'} | ConvertTo-Json) -ContentType 'application/json'
```

**Résultat attendu** :

```json
{
  "success": true,
  "flights": [
    {
      "id": "amadeus-real-1",
      "source": "amadeus",
      "price": {
        "total": 450.50,
        "currency": "EUR"
      },
      ...
    }
  ],
  "meta": {
    "sources": ["amadeus"],
    "totalResults": 10
  }
}
```

Si vous voyez `"source": "amadeus-mock"`, c'est que la clé n'est pas correctement configurée.

---

## 2️⃣ OPENAI API (RECOMMANDÉ)

### Pourquoi OpenAI ?

- Prédictions de prix intelligentes avec GPT-4
- Recommandations personnalisées
- Analyse de tendances

### 💰 Coût Estimé

- **GPT-4** : ~$0.03 par prédiction de prix
- **Usage typique** : $2-5/mois pour usage personnel
- **Alternative** : Le système utilise un fallback statistique gratuit si pas configuré

### 📝 Étapes Détaillées

#### A) Créer un compte OpenAI

1. Aller sur https://platform.openai.com/signup
2. Créer un compte (Gmail recommandé)
3. Vérifier votre email
4. **Vérifier votre numéro de téléphone** (SMS requis)

#### B) Ajouter un moyen de paiement

1. Aller sur https://platform.openai.com/account/billing/overview
2. Cliquer sur "Add payment method"
3. Ajouter votre carte bancaire
4. **Définir une limite de dépenses** (ex: $10/mois) pour éviter les surprises

#### C) Générer une API Key

1. Aller sur https://platform.openai.com/api-keys
2. Cliquer sur **"+ Create new secret key"**
3. Donner un nom : `SMART-TRIP`
4. **Copier immédiatement la clé** (elle ne sera plus visible !)
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### D) Configurer dans SMART-TRIP

1. Ouvrir `.env`
2. Modifier :
   ```env
   OPENAI_API_KEY=sk-proj-votre_cle_ici
   AI_MODEL=gpt-4
   AI_PREDICTION_ENABLED=true
   ```

#### E) Tester les prédictions IA

```bash
# Redémarrer le serveur
npm start

# Tester l'endpoint de prédiction
node test-ai-flight-search.js
```

Dans les logs, vous devriez voir :

```
[info]: Using OpenAI GPT-4 for price predictions
[info]: AI prediction confidence: high
```

### 🔄 Désactiver les Prédictions IA (pour économiser)

Si vous voulez désactiver temporairement GPT-4 :

```env
AI_PREDICTION_ENABLED=false
```

Le système utilisera automatiquement le fallback statistique gratuit.

---

## 3️⃣ SKYSCANNER API (OPTIONNEL)

### Pourquoi Skyscanner ?

- Comparaison de prix avec une 2ème source
- Détection des meilleures offres
- Redondance si Amadeus est hors ligne

### ⚠️ Limitation

Skyscanner exige souvent une **entreprise enregistrée** pour approuver l'accès API. Pour un projet étudiant, vous avez 2 options :

#### Option A : Demander l'accès (peut être refusé)

1. Aller sur https://partners.skyscanner.net/sign-up
2. Remplir le formulaire avec :
   - **Company** : Votre école (ESME)
   - **Website** : URL de votre GitHub
   - **Use case** : "Educational project - flight comparison tool"
3. Attendre l'approbation (3-7 jours)

#### Option B : Utiliser RapidAPI (alternative payante mais rapide)

1. Aller sur https://rapidapi.com/skyscanner/api/skyscanner-flight-search
2. S'inscrire (gratuit)
3. Choisir le plan "Basic" (500 requêtes/mois gratuites)
4. Copier votre **RapidAPI Key**

**Configuration** :

```env
SKYSCANNER_API_KEY=votre_cle_rapidapi
SKYSCANNER_BASE_URL=https://skyscanner-flight-search.p.rapidapi.com
```

#### Option C : Ne pas utiliser Skyscanner

Le système fonctionne parfaitement avec **Amadeus seul** ! Skyscanner est optionnel.

Pour désactiver Skyscanner :

```env
# Laisser vide ou commenter
# SKYSCANNER_API_KEY=
```

---

## 4️⃣ VPN SERVICE (OPTIONNEL - Futur)

Cette fonctionnalité est **simulée** pour l'instant. La vraie implémentation nécessiterait un service VPN commercial comme :

- **NordVPN Teams** (~$100/mois)
- **Bright Data** (~$500/mois)

Pour le moment, laisser :

```env
VPN_ENABLED=false
```

---

## ✅ Vérification Finale

### Checklist de Configuration

Après avoir configuré vos clés, vérifiez le fichier `.env` :

```env
# ✅ Obligatoire - Amadeus
AMADEUS_API_KEY=votre_vraie_cle_ici          # ✅ Configuré
AMADEUS_API_SECRET=votre_vrai_secret_ici     # ✅ Configuré
AMADEUS_BASE_URL=https://test.api.amadeus.com # ✅ OK

# ⚠️ Recommandé - OpenAI
OPENAI_API_KEY=sk-proj-votre_cle_ici         # ⚠️ Recommandé
AI_MODEL=gpt-4                                # ✅ OK
AI_PREDICTION_ENABLED=true                    # ✅ OK

# ❌ Optionnel - Skyscanner
SKYSCANNER_API_KEY=                           # ❌ Optionnel (laisser vide OK)

# ❌ Futur - VPN
VPN_ENABLED=false                             # ✅ OK
```

### Test Complet

1. **Redémarrer le serveur** :

   ```bash
   # Arrêter
   STOP.bat

   # Redémarrer
   START.bat
   ```

2. **Tester chaque endpoint** :

   ```bash
   node test-ai-flight-search.js
   ```

3. **Vérifier les logs** :

   ```bash
   # Chercher ces messages dans les logs
   type logs\app.log | Select-String "Amadeus"
   ```

   **Logs attendus avec vraies APIs** :

   ```
   [info]: Amadeus access token obtained successfully
   [info]: Searching flights on Amadeus API
   [info]: Found 15 flights from Amadeus
   [info]: AI scored 15 flights for user anonymous
   ```

   **Logs avec mock data** :

   ```
   [warn]: Amadeus API not configured, using mock data
   ```

---

## 🚨 Résolution des Problèmes

### Problème : "Invalid API Key"

**Cause** : Clé Amadeus incorrecte ou expirée

**Solution** :

1. Vérifier que vous avez bien copié API Key ET API Secret
2. Vérifier qu'il n'y a pas d'espaces avant/après
3. Se reconnecter sur https://developers.amadeus.com/my-apps
4. Vérifier que l'app est en statut "Active"

### Problème : "Rate limit exceeded"

**Cause** : Trop de requêtes (limite Amadeus Test : ~2000/mois)

**Solutions** :

1. Attendre le reset mensuel
2. Passer en mode Production (payant)
3. Utiliser le cache pour réduire les appels API

### Problème : "Insufficient credits" (OpenAI)

**Cause** : Pas assez de crédit sur votre compte OpenAI

**Solution** :

1. Ajouter du crédit sur https://platform.openai.com/account/billing
2. Ou désactiver temporairement : `AI_PREDICTION_ENABLED=false`

### Problème : Toujours des données MOCK

**Cause** : Fichier `.env` non pris en compte

**Solutions** :

1. Vérifier que le fichier s'appelle bien `.env` (pas `.env.txt`)
2. Redémarrer complètement le serveur
3. Vérifier avec :
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.AMADEUS_API_KEY)"
   ```

---

## 💡 Conseils d'Optimisation

### Réduire les Coûts OpenAI

1. **Cacher les prédictions** : Déjà implémenté (cache 7 jours)
2. **Utiliser GPT-3.5** au lieu de GPT-4 :
   ```env
   AI_MODEL=gpt-3.5-turbo  # 10x moins cher
   ```
3. **Limiter les appels** : Ne prédire que si l'utilisateur clique

### Optimiser Amadeus (Test)

1. **Réutiliser les recherches** : Cache 24h implémenté
2. **Limiter les résultats** : Utiliser `maxResults=10`
3. **Grouper les recherches** : Batch plusieurs requêtes

### Mode Hybride (Recommandé pour Débuter)

```env
# Utiliser Amadeus réel + IA statistique (sans OpenAI)
AMADEUS_API_KEY=votre_cle_amadeus
AMADEUS_API_SECRET=votre_secret_amadeus
OPENAI_API_KEY=                    # Laisser vide
AI_PREDICTION_ENABLED=true          # Utilise le fallback statistique gratuit
```

---

## 📊 Comparaison des Configurations

| Configuration          | Coût/mois | Qualité    | Recommandé pour       |
| ---------------------- | --------- | ---------- | --------------------- |
| **Tout MOCK**          | 0€        | Faible     | Développement initial |
| **Amadeus Test seul**  | 0€        | Moyenne    | Tests & démo          |
| **Amadeus + Stats IA** | 0€        | Bonne      | Production gratuite   |
| **Amadeus + GPT-4**    | ~5€       | Excellente | Production premium    |
| **Toutes APIs**        | ~20€      | Maximale   | Production complète   |

---

## 🎓 Pour Votre Projet Étudiant

### Configuration Recommandée

```env
# Minimum viable pour une démo professionnelle
AMADEUS_API_KEY=votre_cle_test_amadeus       # GRATUIT
AMADEUS_API_SECRET=votre_secret_amadeus      # GRATUIT
AMADEUS_BASE_URL=https://test.api.amadeus.com

OPENAI_API_KEY=                               # Laisser vide
AI_PREDICTION_ENABLED=true                    # Fallback gratuit

SKYSCANNER_API_KEY=                           # Pas nécessaire
```

**Résultat** :

- ✅ Vraies données de vols (500+ compagnies)
- ✅ Scoring IA fonctionnel
- ✅ Prédictions de prix (statistiques)
- ✅ 100% gratuit
- ✅ 2000 requêtes/mois (largement suffisant)

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Documentation officielle** :

   - Amadeus : https://developers.amadeus.com/self-service
   - OpenAI : https://platform.openai.com/docs

2. **Logs SMART-TRIP** :

   ```bash
   type logs\app.log
   ```

3. **Test manuel** :

   ```bash
   node test-ai-flight-search.js
   ```

4. **GitHub Issues** :
   https://github.com/popolpaulo/SMART-TRIP/issues

---

**Dernière mise à jour** : 5 novembre 2025  
**Auteur** : Paul M. & GitHub Copilot
