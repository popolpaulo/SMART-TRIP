#!/usr/bin/env pwsh
# Script pour demarrer TOUT le systeme SMART TRIP (Backend + Frontend + Database)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Démarrage complet du système" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Vérifier que Docker est démarré
Write-Host "✓ Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker n'est pas accessible"
    }
    Write-Host "  [OK] Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Docker Desktop ne répond pas ou n'est pas démarré." -ForegroundColor Red
    Write-Host "  ➜ Tentative de démarrage de Docker Desktop..." -ForegroundColor Yellow

    $dockerExe = Join-Path $Env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
    if (Test-Path $dockerExe) {
        Start-Process -FilePath $dockerExe -ErrorAction SilentlyContinue | Out-Null
    }

    # Attendre jusqu'à 90s que le daemon réponde
    $maxWait = 90
    $elapsed = 0
    while ($elapsed -lt $maxWait) {
        Start-Sleep -Seconds 3
        $elapsed += 3
        docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { break }
        Write-Host "." -NoNewline -ForegroundColor DarkCyan
    }
    Write-Host ""

    docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERREUR] Docker est indisponible. Impossible de continuer." -ForegroundColor Red
        Write-Host "  Problème courant sur Windows : WSL non réactif (WSL is unresponsive)." -ForegroundColor Yellow
        Write-Host ""; Write-Host "  Suivez ces étapes dans PowerShell (Administrateur) :" -ForegroundColor Cyan
        Write-Host "    1) wsl --shutdown" -ForegroundColor White
        Write-Host "    2) wsl --update" -ForegroundColor White
        Write-Host "    3) dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart" -ForegroundColor White
        Write-Host "    4) dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart" -ForegroundColor White
        Write-Host "    5) Redémarrez Windows, puis relancez Docker Desktop" -ForegroundColor White
        Write-Host "    6) Dans Docker Desktop → Settings → Resources → WSL integration : cochez votre distro (Ubuntu)" -ForegroundColor White
        Write-Host ""; Write-Host "  Astuce : exécutez ensuite START-ALL.bat de nouveau." -ForegroundColor Gray
        exit 1
    }

    Write-Host "  [OK] Docker a été démarré" -ForegroundColor Green
}

# Vérifier que PostgreSQL est démarré
Write-Host "✓ Vérification de PostgreSQL..." -ForegroundColor Yellow
$pgRunning = docker ps --filter "name=smarttrip_db" --format "{{.Names}}" 2>$null

if ($pgRunning -ne "smarttrip_db") {
    Write-Host "  PostgreSQL n'est pas démarré. Démarrage..." -ForegroundColor Yellow
    docker-compose up -d
    
    # Attendre que PostgreSQL soit prêt
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

Write-Host "  [OK] PostgreSQL est prêt (port 5433)" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "   Démarrage des serveurs..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Créer un job pour le backend
Write-Host "➜ Démarrage du Backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}
Write-Host "  [OK] Backend démarré (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Attendre 3 secondes pour que le backend démarre
Start-Sleep -Seconds 3

# Créer un job pour le frontend
Write-Host "➜ Démarrage du Frontend..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    npm run dev
}
Write-Host "  [OK] Frontend démarré (Job ID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "   🚀 SMART TRIP est maintenant en cours d'exécution !" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  📡 Backend API     : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "  🌐 Frontend Web    : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "  🗄️  PostgreSQL     : " -NoNewline -ForegroundColor White
Write-Host "localhost:5433" -ForegroundColor Green
Write-Host "  🔧 PgAdmin         : " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5051" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  ⚠️  Appuyez sur Ctrl+C pour arrêter tous les serveurs" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# Fonction pour nettoyer les jobs à l'arrêt
function Cleanup {
    Write-Host "`n`nArrêt des serveurs..." -ForegroundColor Yellow
    
    # Arrêter les jobs
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Retirer les jobs
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
    
    # Tuer les processus Node.js restants
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Host "Serveurs arrêtés !" -ForegroundColor Green
    exit
}

# Enregistrer le gestionnaire d'événements pour Ctrl+C
try {
    [Console]::TreatControlCAsInput = $false
    $null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }
} catch {
    # Ignorer les erreurs
}

# Boucle infinie pour afficher les logs des deux serveurs
Write-Host "📋 Logs en temps réel :" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
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
        
        # Vérifier si les jobs sont toujours en cours
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Stopped") {
            Write-Host "`n[ERREUR] Le backend s'est arrêté !" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Stopped") {
            Write-Host "`n[ERREUR] Le frontend s'est arrêté !" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
} catch {
    # Ctrl+C intercepté
} finally {
    Cleanup
}
