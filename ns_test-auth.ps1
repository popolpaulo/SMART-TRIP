# Script de test rapide pour l'authentification SmartTrip
# Ce fichier est non-significatif (ns_) pour le fonctionnement de l'application

Write-Host "🧪 Tests du système d'authentification SmartTrip" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/auth"

# 1. Test d'inscription
Write-Host "1️⃣  Test d'inscription..." -ForegroundColor Yellow
$registerBody = @{
    email = "test.user@smarttrip.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    phone = "+33612345678"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/register" `
        -Method POST `
        -ContentType 'application/json' `
        -Body $registerBody `
        -UseBasicParsing
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Inscription réussie!" -ForegroundColor Green
    Write-Host "   User: $($registerData.user.firstName) $($registerData.user.lastName)" -ForegroundColor Gray
    Write-Host "   Email: $($registerData.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($registerData.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $registerData.token
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   ⚠️  Email déjà utilisé, on teste la connexion..." -ForegroundColor Yellow
        
        # 2. Test de connexion (si inscription a échoué)
        Write-Host ""
        Write-Host "2️⃣  Test de connexion..." -ForegroundColor Yellow
        $loginBody = @{
            email = "test.user@smarttrip.com"
            password = "password123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" `
                -Method POST `
                -ContentType 'application/json' `
                -Body $loginBody `
                -UseBasicParsing
            
            $loginData = $loginResponse.Content | ConvertFrom-Json
            Write-Host "   ✅ Connexion réussie!" -ForegroundColor Green
            Write-Host "   User: $($loginData.user.firstName) $($loginData.user.lastName)" -ForegroundColor Gray
            $token = $loginData.token
        } catch {
            Write-Host "   ❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   ❌ Erreur d'inscription: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 3. Test de récupération du profil
Write-Host "3️⃣  Test de récupération du profil..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/profile" `
        -Headers $headers `
        -UseBasicParsing
    
    $profileData = $profileResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Profil récupéré!" -ForegroundColor Green
    Write-Host "   Nom complet: $($profileData.user.firstName) $($profileData.user.lastName)" -ForegroundColor Gray
    Write-Host "   Email: $($profileData.user.email)" -ForegroundColor Gray
    Write-Host "   Téléphone: $($profileData.user.phone)" -ForegroundColor Gray
    Write-Host "   Budget: $($profileData.user.profile.budgetRange)" -ForegroundColor Gray
    Write-Host "   Classe préférée: $($profileData.user.profile.preferredClass)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test de mise à jour du profil
Write-Host "4️⃣  Test de mise à jour du profil..." -ForegroundColor Yellow
$updateBody = @{
    budgetRange = "medium"
    preferredClass = "business"
    comfortLevel = "premium"
    travelStyle = "relax"
    maxStops = 1
    seatPreference = "window"
    mealPreference = "vegetarian"
    newsletterSubscribed = $true
} | ConvertTo-Json

try {
    $updateResponse = Invoke-WebRequest -Uri "$baseUrl/profile" `
        -Method PUT `
        -Headers $headers `
        -ContentType 'application/json' `
        -Body $updateBody `
        -UseBasicParsing
    
    $updateData = $updateResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Profil mis à jour!" -ForegroundColor Green
    Write-Host "   Budget: $($updateData.user.profile.budgetRange)" -ForegroundColor Gray
    Write-Host "   Classe: $($updateData.user.profile.preferredClass)" -ForegroundColor Gray
    Write-Host "   Confort: $($updateData.user.profile.comfortLevel)" -ForegroundColor Gray
    Write-Host "   Style: $($updateData.user.profile.travelStyle)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test de vérification du token
Write-Host "5️⃣  Test de vérification du token..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "$baseUrl/verify" `
        -Headers $headers `
        -UseBasicParsing
    
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Token valide!" -ForegroundColor Green
    Write-Host "   User ID: $($verifyData.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Token invalide: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Tests terminés!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Vous pouvez maintenant tester le frontend sur http://localhost:5173" -ForegroundColor Blue
Write-Host "   - Inscription: http://localhost:5173/register" -ForegroundColor Gray
Write-Host "   - Connexion: http://localhost:5173/login" -ForegroundColor Gray
Write-Host "   - Profil: http://localhost:5173/profile (nécessite connexion)" -ForegroundColor Gray
