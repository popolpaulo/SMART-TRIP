#!/usr/bin/env pwsh
# Script pour demarrer TOUT le systeme SMART TRIP (Backend + Frontend + Database)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Demarrage complet du systeme" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Verifier que Docker est demarre
Write-Host "Verification de Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker n'est pas accessible"
    }
    Write-Host "  [OK] Docker est demarre" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Docker n'est pas demarre !" -ForegroundColor Red
    Write-Host "  Demarrage de Docker..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 5
}

# Verifier que PostgreSQL est demarre
Write-Host "Verification de PostgreSQL..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=smarttrip_db" --format "{{.Names}}" 2>$null

if ($pgRunning -ne "smarttrip_db") {
    Write-Host "  PostgreSQL n'est pas demarre. Demarrage..." -ForegroundColor Yellow
    docker-compose up -d
    
    # Attendre que PostgreSQL soit pret
    Write-Host "  Attente de PostgreSQL..." -ForegroundColor Cyan
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

Write-Host "  [OK] PostgreSQL est pret (port 5433)" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "   Demarrage des serveurs..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Creer un job pour le backend
Write-Host "Demarrage du Backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}
Write-Host "  [OK] Backend demarre (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Attendre 3 secondes pour que le backend demarre
Start-Sleep -Seconds 3

# Creer un job pour le frontend
Write-Host "Demarrage du Frontend..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    npm run dev
}
Write-Host "  [OK] Frontend demarre (Job ID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "   SMART TRIP est maintenant en cours d'execution !" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Backend API     : http://localhost:3000" -ForegroundColor Green
Write-Host "  Frontend Web    : http://localhost:5173" -ForegroundColor Green
Write-Host "  PostgreSQL      : localhost:5433" -ForegroundColor Green
Write-Host "  PgAdmin         : http://localhost:5051" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  Appuyez sur Ctrl+C pour arreter tous les serveurs" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# Fonction pour nettoyer les jobs a l'arret
function Cleanup {
    Write-Host "`n`nArret des serveurs..." -ForegroundColor Yellow
    
    # Arreter les jobs
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Retirer les jobs
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
    
    # Tuer les processus Node.js restants
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Host "Serveurs arretes !" -ForegroundColor Green
    exit
}

# Enregistrer le gestionnaire d'evenements pour Ctrl+C
try {
    [Console]::TreatControlCAsInput = $false
    $null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }
} catch {
    # Ignorer les erreurs
}

# Boucle infinie pour afficher les logs des deux serveurs
Write-Host "Logs en temps reel :" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor DarkGray
Write-Host ""

try {
    while ($true) {
        # Afficher les logs du backend
        $backendOutput = Receive-Job $backendJob 2>&1
        if ($backendOutput) {
            foreach ($line in $backendOutput) {
                Write-Host "[BACKEND]  " -NoNewline -ForegroundColor Blue
                Write-Host $line
            }
        }
        
        # Afficher les logs du frontend
        $frontendOutput = Receive-Job $frontendJob 2>&1
        if ($frontendOutput) {
            foreach ($line in $frontendOutput) {
                Write-Host "[FRONTEND] " -NoNewline -ForegroundColor Magenta
                Write-Host $line
            }
        }
        
        # Verifier si les jobs sont toujours en cours
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Stopped") {
            Write-Host "`n[ERREUR] Le backend s'est arrete !" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Stopped") {
            Write-Host "`n[ERREUR] Le frontend s'est arrete !" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
} catch {
    # Ctrl+C intercepte
} finally {
    Cleanup
}