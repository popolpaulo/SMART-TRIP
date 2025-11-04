#!/usr/bin/env pwsh
# Script pour demarrer le serveur SMART TRIP en mode developpement

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Demarrage du serveur" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Verifier que Docker est demarre
Write-Host "Verification de Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker n'est pas accessible"
    }
    Write-Host "[OK] Docker est demarre" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker n'est pas demarre !" -ForegroundColor Red
    Write-Host "Demarrage de Docker..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 5
}

# Verifier que PostgreSQL est demarre
Write-Host "Verification de PostgreSQL..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=smarttrip_db" --format "{{.Names}}" 2>$null

if ($pgRunning -ne "smarttrip_db") {
    Write-Host "PostgreSQL n'est pas demarre. Demarrage..." -ForegroundColor Yellow
    docker-compose up -d
    
    # Attendre que PostgreSQL soit pret
    Write-Host "Attente de PostgreSQL..." -ForegroundColor Cyan
    $maxAttempts = 20
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        try {
            docker exec smarttrip_db pg_isready -U smarttrip_user -d smarttrip_dev 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                break
            }
        } catch {
            # Continuer
        }
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Cyan
    }
    Write-Host ""
}

Write-Host "[OK] PostgreSQL est pret" -ForegroundColor Green
Write-Host ""

# Demarrer le serveur
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Demarrage du serveur en mode developpement..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Le serveur sera accessible sur : http://localhost:3000" -ForegroundColor Cyan
Write-Host "PgAdmin disponible sur        : http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur" -ForegroundColor Yellow
Write-Host ""

npm run dev
