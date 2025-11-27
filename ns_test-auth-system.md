# Tests du système d'authentification SmartTrip

## Backend - Routes API

### 1. Test d'inscription
```powershell
$body = @{
    email = "test@smarttrip.com"
    password = "test123"
    firstName = "Jean"
    lastName = "Dupont"
    phone = "+33612345678"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/register `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### 2. Test de connexion
```powershell
$body = @{
    email = "test@smarttrip.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body `
    -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$token = $data.token
Write-Host "Token: $token"
```

### 3. Test de récupération du profil
```powershell
# Utiliser le token obtenu lors de la connexion
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:3000/api/auth/profile `
    -Headers $headers `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### 4. Test de mise à jour du profil
```powershell
$body = @{
    firstName = "Jean-Paul"
    budgetRange = "medium"
    preferredClass = "business"
    travelStyle = "relax"
    maxStops = 1
    seatPreference = "window"
    newsletterSubscribed = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:3000/api/auth/profile `
    -Method PUT `
    -Headers $headers `
    -ContentType 'application/json' `
    -Body $body `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### 5. Test de vérification du token
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:3000/api/auth/verify `
    -Headers $headers `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Frontend - Tests manuels

### 1. Test d'inscription
- Aller sur http://localhost:5173/register
- Remplir le formulaire avec :
  - Prénom: Jean
  - Nom: Dupont
  - Email: jean.dupont@test.com
  - Téléphone: +33612345678
  - Mot de passe: test123
  - Confirmation: test123
- Cliquer sur "Créer mon compte"
- Vérifier la redirection vers la page d'accueil
- Vérifier que le nom s'affiche dans le header

### 2. Test de connexion
- Se déconnecter (menu utilisateur > Déconnexion)
- Aller sur http://localhost:5173/login
- Se connecter avec :
  - Email: jean.dupont@test.com
  - Mot de passe: test123
- Vérifier la redirection et l'affichage du nom

### 3. Test du profil
- Cliquer sur le menu utilisateur > Mon profil
- Onglet "Informations personnelles" :
  - Modifier le téléphone
  - Ajouter une date de naissance
  - Sélectionner une nationalité
- Onglet "Préférences de voyage" :
  - Sélectionner une gamme de budget
  - Choisir une classe de vol
  - Définir le style de voyage
  - Configurer les préférences de siège et repas
- Cliquer sur "Enregistrer les modifications"
- Vérifier le message de succès
- Recharger la page et vérifier que les modifications sont persistées

### 4. Test de route protégée
- Se déconnecter
- Essayer d'accéder directement à http://localhost:5173/profile
- Vérifier la redirection automatique vers /login

### 5. Test de persistance
- Se connecter
- Fermer le navigateur
- Rouvrir http://localhost:5173
- Vérifier que l'utilisateur est toujours connecté (grâce au token dans localStorage)

## Vérifications base de données

### Vérifier les utilisateurs créés
```powershell
docker exec -it smarttrip_db psql -U smarttrip_user -d smarttrip_dev -c "SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### Vérifier les profils utilisateurs
```powershell
docker exec -it smarttrip_db psql -U smarttrip_user -d smarttrip_dev -c "SELECT u.email, p.budget_range, p.preferred_class, p.travel_style FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id LIMIT 5;"
```

## Cas d'erreur à tester

### 1. Email déjà utilisé
- Essayer de créer un compte avec un email existant
- Vérifier le message d'erreur: "Cet email est déjà utilisé"

### 2. Mot de passe trop court
- Essayer de créer un compte avec un mot de passe < 6 caractères
- Vérifier le message d'erreur

### 3. Mots de passe différents
- Remplir mot de passe et confirmation avec des valeurs différentes
- Vérifier le message: "Les mots de passe ne correspondent pas"

### 4. Mauvais identifiants
- Essayer de se connecter avec un mauvais email ou mot de passe
- Vérifier le message: "Email ou mot de passe incorrect"

### 5. Token invalide
- Modifier manuellement le token dans localStorage
- Recharger la page
- Vérifier que l'utilisateur est déconnecté automatiquement

## Résultats attendus

✅ Inscription réussie avec génération de token JWT
✅ Connexion réussie avec récupération des infos utilisateur
✅ Profil récupéré avec toutes les préférences
✅ Profil mis à jour avec succès
✅ Token vérifié et utilisateur authentifié
✅ Routes protégées inaccessibles sans authentification
✅ Déconnexion supprime le token et redirige
✅ Persistance de la session via localStorage
✅ Affichage conditionnel du menu selon l'état de connexion
