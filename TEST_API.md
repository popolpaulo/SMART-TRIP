# Tests API SMART TRIP

Ce document contient des exemples de commandes pour tester l'API SMART TRIP.

## Prérequis

Le serveur doit être démarré :
```bash
.\START.bat
# OU
npm run dev
```

## Tests PowerShell

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

**Résultat attendu :**
```json
{
  "status": "OK",
  "timestamp": "2025-11-04T13:43:28.340Z",
  "environment": "development"
}
```

### 2. Page d'accueil

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET
```

**Résultat attendu :**
```json
{
  "message": "Bienvenue sur SMART TRIP API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "users": "/api/users",
    "flights": "/api/flights",
    "hotels": "/api/hotels",
    "trips": "/api/trips",
    "search": "/api/search",
    "alerts": "/api/alerts"
  }
}
```

### 3. Destinations tendances

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/search/trending" -Method GET
```

**Résultat attendu :** Liste de 6 destinations avec city, country_name, trend_score, average_price...

### 4. Connexion utilisateur

```powershell
$body = @{
    email = 'test@smarttrip.com'
    password = 'Test123!'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType 'application/json'

# Afficher le token
$response.token

# Sauvegarder le token pour les prochaines requêtes
$token = $response.token
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@smarttrip.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### 5. Inscription d'un nouvel utilisateur

```powershell
$body = @{
    email = 'nouveau@example.com'
    password = 'Test123!'
    firstName = 'John'
    lastName = 'Doe'
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType 'application/json'
```

### 6. Profil utilisateur (endpoint protégé)

```powershell
# Utiliser le token obtenu lors de la connexion
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Method GET -Headers $headers
```

**Résultat attendu :** Profil complet de l'utilisateur

### 7. Recherche de vols

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    origin = 'PAR'
    destination = 'NYC'
    departureDate = '2025-12-01'
    returnDate = '2025-12-10'
    passengers = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/flights/search" -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

### 8. Créer une alerte de prix

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    origin = 'PAR'
    destination = 'NYC'
    departureDate = '2025-12-01'
    maxPrice = 500
    alertEmail = 'test@smarttrip.com'
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/alerts" -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

### 9. Lister mes alertes

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/alerts" -Method GET -Headers $headers
```

### 10. Créer un voyage

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    title = 'Voyage à New York'
    destination = 'New York, USA'
    startDate = '2025-12-01'
    endDate = '2025-12-10'
    budget = 2000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/trips" -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

## Tests avec curl (Alternative)

### Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@smarttrip.com\",\"password\":\"Test123!\"}"
```

### Profil utilisateur

```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Utilisateurs de test disponibles

Après `npm run db:seed`, vous avez accès à ces comptes :

| Email | Mot de passe | Nom |
|-------|--------------|-----|
| test@smarttrip.com | Test123! | Jean Dupont |
| marie@smarttrip.com | Test123! | Marie Martin |
| paul@smarttrip.com | Test123! | Paul Bernard |

## Tests complets automatisés

Script PowerShell pour tester tous les endpoints :

```powershell
# 1. Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

# 2. Connexion
Write-Host "`nTest 2: Connexion" -ForegroundColor Cyan
$body = @{email='test@smarttrip.com'; password='Test123!'} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Token obtenu: $($token.Substring(0,50))..." -ForegroundColor Green

# 3. Profil
Write-Host "`nTest 3: Profil utilisateur" -ForegroundColor Cyan
$headers = @{Authorization="Bearer $token"}
$profile = Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Method GET -Headers $headers
Write-Host "Email: $($profile.email)" -ForegroundColor Green

# 4. Destinations tendances
Write-Host "`nTest 4: Destinations tendances" -ForegroundColor Cyan
$trending = Invoke-RestMethod -Uri "http://localhost:3000/api/search/trending" -Method GET
Write-Host "Nombre de destinations: $($trending.Count)" -ForegroundColor Green

Write-Host "`n✅ Tous les tests sont passés!" -ForegroundColor Green
```

## Dépannage

### Erreur 401 Unauthorized
- Vérifiez que le token JWT est valide
- Reconnectez-vous pour obtenir un nouveau token

### Erreur 404 Not Found
- Vérifiez l'URL de l'endpoint
- Assurez-vous que le serveur est démarré

### Erreur 500 Internal Server Error
- Consultez les logs : `.\logs\error.log`
- Vérifiez la connexion à la base de données

### Le serveur ne répond pas
- Vérifiez que le serveur est démarré : `npm run dev`
- Vérifiez le port : http://localhost:3000

## Prochaines étapes

1. Intégrer des APIs externes (Amadeus, Skyscanner)
2. Implémenter les recherches de vols réelles
3. Ajouter le système de paiement
4. Développer l'interface frontend
5. Mettre en place les notifications en temps réel

---

**Happy Testing! 🚀**
