#!/usr/bin/env pwsh
# Script de setup automatique pour SMART TRIP
# Execute toutes les etapes d'installation

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Installation automatique" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Fonction pour afficher les etapes
function Show-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[ETAPE] $Message" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
}

# Fonction pour afficher le succes
function Show-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

# Fonction pour afficher les erreurs
function Show-Error {
    param([string]$Message)
    Write-Host "[ERREUR] $Message" -ForegroundColor Red
}

try {
    # Verifier Node.js
    Show-Step "Verification de Node.js..."
    try {
        $nodeVersion = node --version
        Show-Success "Node.js est installe : $nodeVersion"
    } catch {
        Show-Error "Node.js n'est pas installe !"
        Write-Host "Telechargez Node.js depuis : https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    # Verifier Docker
    Show-Step "Verification de Docker..."
    try {
        $dockerVersion = docker --version
        Show-Success "Docker est installe : $dockerVersion"
    } catch {
        Show-Error "Docker n'est pas installe !"
        Write-Host "Telechargez Docker Desktop depuis : https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }

    # Verifier que Docker est demarre
    Show-Step "Verification que Docker est demarre..."
    try {
        docker ps | Out-Null
        Show-Success "Docker est demarre"
    } catch {
        Show-Error "Docker n'est pas demarre !"
        Write-Host "Veuillez demarrer Docker Desktop et reessayer." -ForegroundColor Yellow
        exit 1
    }

    # Etape 1 : Installer les dependances npm
    Show-Step "Etape 1/5 : Installation des dependances npm..."
    if (Test-Path "node_modules") {
        Write-Host "Les dependances sont deja installees, mise a jour..." -ForegroundColor Cyan
    }
    npm install
    Show-Success "Dependances installees avec succes"

    # Verifier si .env existe
    if (-not (Test-Path ".env")) {
        Show-Step "Creation du fichier .env..."
        Copy-Item ".env.example" ".env"
        Show-Success "Fichier .env cree"
    } else {
        Write-Host "Le fichier .env existe deja" -ForegroundColor Cyan
    }

    # Etape 2 : Demarrer Docker
    Show-Step "Etape 2/5 : Demarrage de Docker (PostgreSQL + PgAdmin)..."
    
    # Arreter les conteneurs existants s'ils existent
    docker-compose down 2>$null
    
    # Demarrer les conteneurs
    docker-compose up -d
    
    # Attendre que PostgreSQL soit pret
    Write-Host "Attente du demarrage de PostgreSQL..." -ForegroundColor Cyan
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while (-not $ready -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempt++
        try {
            docker exec smarttrip_db pg_isready -U smarttrip_user -d smarttrip_dev 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $ready = $true
            }
        } catch {
            # Continuer a attendre
        }
        Write-Host "." -NoNewline -ForegroundColor Cyan
    }
    
    Write-Host ""
    if ($ready) {
        Show-Success "PostgreSQL est pret !"
    } else {
        Show-Error "PostgreSQL n'a pas demarre dans le temps imparti"
        Write-Host "Verifiez les logs avec : docker-compose logs postgres" -ForegroundColor Yellow
        exit 1
    }

    # Etape 3 : Creer les tables
    Show-Step "Etape 3/5 : Creation des tables de la base de donnees..."
    npm run db:migrate
    Show-Success "Tables creees avec succes"

    # Etape 4 : Inserer les donnees de test
    Show-Step "Etape 4/5 : Insertion des donnees de test..."
    npm run db:seed
    Show-Success "Donnees de test inserees"

    # Etape 5 : Informations finales
    Show-Step "Etape 5/5 : Installation terminee !"
    
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "   Installation reussie !" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services disponibles :" -ForegroundColor Cyan
    Write-Host "   - PostgreSQL    : localhost:5432" -ForegroundColor White
    Write-Host "   - PgAdmin       : http://localhost:5050" -ForegroundColor White
    Write-Host ""
    Write-Host "Utilisateurs de test :" -ForegroundColor Cyan
    Write-Host "   - Email    : test@smarttrip.com" -ForegroundColor White
    Write-Host "   - Password : Test123!" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour demarrer le serveur, utilisez :" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   OU lancez le script :" -ForegroundColor Cyan
    Write-Host "   .\start.ps1" -ForegroundColor Yellow
    Write-Host ""

} catch {
    Write-Host ""
    Show-Error "Une erreur s'est produite : $_"
    Write-Host ""
    Write-Host "Pour plus d'informations, consultez :" -ForegroundColor Yellow
    Write-Host "  - README.md" -ForegroundColor White
    Write-Host "  - GETTING_STARTED.md" -ForegroundColor White
    exit 1
}
