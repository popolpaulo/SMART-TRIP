#!/usr/bin/env pwsh
# Script pour demarrer TOUT le systeme SMART TRIP (Backend + Frontend + Database)
# Avec verification automatique et installation des dependances manquantes

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Demarrage complet du systeme" -ForegroundColor Cyan
Write-Host "   Version: 2.0 - Auto-installation" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$workspaceRoot = $PSScriptRoot

# ============================================================
# FONCTION: Verifier si une commande existe
# ============================================================
function Test-CommandExists {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command -ErrorAction Stop) { return $true }
    } catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# ============================================================
# FONCTION: Verifier et installer Node.js
# ============================================================
function Ensure-NodeJS {
    Write-Host "Verification de Node.js..." -ForegroundColor Yellow
    
    if (Test-CommandExists node) {
        $nodeVersion = node --version 2>$null
        Write-Host "  [OK] Node.js $nodeVersion installe" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  [ERREUR] Node.js n'est pas installe !" -ForegroundColor Red
    Write-Host "  Telechargement de Node.js..." -ForegroundColor Yellow
    
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        Write-Host "  Installation de Node.js (cela peut prendre 2-3 minutes)..." -ForegroundColor Cyan
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
        
        # Recharger PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Test-CommandExists node) {
            Write-Host "  [OK] Node.js installe avec succes !" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [ERREUR] Installation echouee. Installez manuellement depuis https://nodejs.org" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [ERREUR] Impossible de telecharger Node.js: $_" -ForegroundColor Red
        Write-Host "  Installez manuellement depuis https://nodejs.org" -ForegroundColor Yellow
        return $false
    }
}

# ============================================================
# FONCTION: Installer les dependances npm
# ============================================================
function Install-NpmDependencies {
    param($path, $name)
    
    Write-Host "Verification des dependances $name..." -ForegroundColor Yellow
    
    Push-Location $path
    
    $needsInstall = $false
    
    # Verifier si node_modules existe
    if (-not (Test-Path "node_modules")) {
        $needsInstall = $true
        Write-Host "  node_modules manquant - installation requise" -ForegroundColor Yellow
    } else {
        # Verifier l'integrite des modules critiques
        if ($name -eq "Backend") {
            $criticalModules = @("openai", "express", "pg", "cors", "dotenv")
        } else {
            $criticalModules = @("react", "vite", "react-router-dom")
        }
        
        foreach ($module in $criticalModules) {
            if (-not (Test-Path "node_modules\$module")) {
                Write-Host "  [ATTENTION] Module critique '$module' manquant !" -ForegroundColor Yellow
                $needsInstall = $true
                break
            }
        }
        
        if (-not $needsInstall) {
            Write-Host "  [OK] Dependances $name deja installees" -ForegroundColor Green
        }
    }
    
    # Installer ou reparer les dependances
    if ($needsInstall) {
        Write-Host "  Installation des dependances $name..." -ForegroundColor Cyan
        Write-Host "  (Cela peut prendre 2-3 minutes, patientez...)" -ForegroundColor Gray
        
        npm install --loglevel=error
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Dependances $name installees" -ForegroundColor Green
        } else {
            Write-Host "  [ERREUR] Echec d'installation des dependances $name" -ForegroundColor Red
            Write-Host "  Essayez manuellement: cd $path && npm install" -ForegroundColor Yellow
            Pop-Location
            return $false
        }
    }
    
    Pop-Location
    return $true
}

# ============================================================
# FONCTION: Verifier et demarrer Docker
# ============================================================
function Ensure-Docker {
    Write-Host "Verification de Docker..." -ForegroundColor Yellow
    
    try {
        docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Docker est demarre" -ForegroundColor Green
            return $true
        }
    } catch { }
    
    Write-Host "  Docker n'est pas accessible. Tentative de demarrage..." -ForegroundColor Yellow
    
    # Chercher Docker Desktop
    $dockerPaths = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Programs\Docker\Docker\Docker Desktop.exe"
    )
    
    $dockerExe = $dockerPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    
    if (-not $dockerExe) {
        Write-Host "  [ERREUR] Docker Desktop n'est pas installe !" -ForegroundColor Red
        Write-Host "  Telechargez-le depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        return $false
    }
    
    # Demarrer Docker Desktop
    Start-Process -FilePath $dockerExe -ErrorAction SilentlyContinue
    
    Write-Host "  Attente du demarrage de Docker (jusqu'a 90 secondes)..." -ForegroundColor Cyan
    $maxWait = 90
    $elapsed = 0
    
    while ($elapsed -lt $maxWait) {
        Start-Sleep -Seconds 3
        $elapsed += 3
        
        try {
            docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n  [OK] Docker demarre avec succes" -ForegroundColor Green
                return $true
            }
        } catch { }
        
        Write-Host "." -NoNewline -ForegroundColor DarkCyan
    }
    
    Write-Host "`n  [ERREUR] Docker n'a pas demarre apres 90 secondes" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Solutions possibles:" -ForegroundColor Yellow
    Write-Host "    1. Ouvrez Docker Desktop manuellement" -ForegroundColor White
    Write-Host "    2. Si erreur WSL, executez en tant qu'Administrateur:" -ForegroundColor White
    Write-Host "       wsl --shutdown" -ForegroundColor Gray
    Write-Host "       wsl --update" -ForegroundColor Gray
    Write-Host "    3. Activez WSL2 dans Docker Desktop -> Settings -> General" -ForegroundColor White
    Write-Host "    4. Redemarrez Windows si necessaire" -ForegroundColor White
    
    return $false
}

# ============================================================
# FONCTION: Verifier et demarrer PostgreSQL
# ============================================================
function Ensure-PostgreSQL {
    Write-Host "Verification de PostgreSQL..." -ForegroundColor Yellow
    
    $pgRunning = docker ps --filter "name=smarttrip_db" --format "{{.Names}}" 2>$null
    
    if ($pgRunning -eq "smarttrip_db") {
        Write-Host "  [OK] PostgreSQL deja demarre" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  Demarrage de PostgreSQL via Docker Compose..." -ForegroundColor Cyan
    Push-Location $workspaceRoot
    
    docker-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERREUR] Echec du demarrage de PostgreSQL" -ForegroundColor Red
        Pop-Location
        return $false
    }
    
    # Attendre que PostgreSQL soit pret
    Write-Host "  Attente de PostgreSQL (jusqu'a 40 secondes)..." -ForegroundColor Cyan
    $maxAttempts = 20
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        
        try {
            docker exec smarttrip_db pg_isready -U smarttrip_user -d smarttrip_dev 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n  [OK] PostgreSQL est pret (port 5433)" -ForegroundColor Green
                Pop-Location
                return $true
            }
        } catch { }
        
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Cyan
    }
    
    Write-Host "`n  [AVERTISSEMENT] PostgreSQL met du temps a demarrer, mais on continue..." -ForegroundColor Yellow
    Pop-Location
    return $true
}

# ============================================================
# FONCTION: Verifier le fichier .env
# ============================================================
function Ensure-EnvFile {
    Write-Host "Verification du fichier .env..." -ForegroundColor Yellow
    
    $envFile = Join-Path $workspaceRoot ".env"
    
    if (Test-Path $envFile) {
        Write-Host "  [OK] Fichier .env existe" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  Creation du fichier .env par defaut..." -ForegroundColor Cyan
    
    $envContent = @"
# Configuration Serveur
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=smarttrip_dev
DB_USER=smarttrip_user
DB_PASSWORD=smarttrip_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# APIs
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
OPENAI_API_KEY=your_openai_api_key

# Logging
LOG_LEVEL=info
"@
    
    Set-Content -Path $envFile -Value $envContent -Encoding UTF8
    Write-Host "  [OK] Fichier .env cree (configurez vos cles API)" -ForegroundColor Green
    return $true
}

# ============================================================
# ETAPE 1: Verifications prerequisites
# ============================================================
Write-Host ""
Write-Host "ETAPE 1/5: Verification des prerequisites" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

if (-not (Ensure-NodeJS)) {
    Write-Host "`n[ECHEC] Node.js est requis. Relancez apres installation." -ForegroundColor Red
    exit 1
}

if (-not (Ensure-Docker)) {
    Write-Host "`n[ECHEC] Docker est requis. Relancez apres demarrage." -ForegroundColor Red
    exit 1
}

Ensure-EnvFile | Out-Null

# ============================================================
# ETAPE 2: Installation des dependances
# ============================================================
Write-Host ""
Write-Host "ETAPE 2/5: Installation des dependances" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

if (-not (Install-NpmDependencies $workspaceRoot "Backend")) {
    Write-Host "`n[ECHEC] Impossible d'installer les dependances backend" -ForegroundColor Red
    exit 1
}

$frontendPath = Join-Path $workspaceRoot "frontend"
if (-not (Install-NpmDependencies $frontendPath "Frontend")) {
    Write-Host "`n[ECHEC] Impossible d'installer les dependances frontend" -ForegroundColor Red
    exit 1
}

# ============================================================
# ETAPE 3: Demarrage de PostgreSQL
# ============================================================
Write-Host ""
Write-Host "ETAPE 3/5: Demarrage de la base de donnees" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

if (-not (Ensure-PostgreSQL)) {
    Write-Host "`n[ECHEC] PostgreSQL n'a pas demarre correctement" -ForegroundColor Red
    exit 1
}

# ============================================================
# ETAPE 4: Demarrage du Backend
# ============================================================
Write-Host ""
Write-Host "ETAPE 4/5: Demarrage du serveur Backend (Node.js)" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    npm start 2>&1
} -ArgumentList $workspaceRoot

Write-Host "  [OK] Backend demarre en arriere-plan (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan

# ============================================================
# ETAPE 5: Demarrage du Frontend
# ============================================================
Write-Host ""
Write-Host "ETAPE 5/5: Demarrage du serveur Frontend (Vite)" -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

$frontendJob = Start-Job -ScriptBlock {
    param($frontPath)
    Set-Location $frontPath
    npm run dev 2>&1
} -ArgumentList $frontendPath

Write-Host "  [OK] Frontend demarre en arriere-plan (PID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host "  URL: http://localhost:5173 ou http://localhost:5174" -ForegroundColor Cyan

# ============================================================
# ATTENTE ET AFFICHAGE DES LOGS
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   SMART TRIP - Systeme demarre avec succes !" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services actifs:" -ForegroundColor White
Write-Host "  - PostgreSQL : http://localhost:5433" -ForegroundColor Cyan
Write-Host "  - Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Frontend   : http://localhost:5173 ou 5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  - Appuyez sur Ctrl+C pour arreter tous les services" -ForegroundColor White
Write-Host "  - Logs backend: docker logs -f smarttrip_backend (si dockerise)" -ForegroundColor Gray
Write-Host "  - Logs PostgreSQL: docker logs -f smarttrip_db" -ForegroundColor Gray
Write-Host ""
Write-Host "Affichage des logs en temps reel (Ctrl+C pour quitter)..." -ForegroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""

# Fonction pour afficher les logs avec couleur
function Show-JobOutput {
    param($job, $color)
    $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
    if ($output) {
        $output | ForEach-Object {
            Write-Host $_ -ForegroundColor $color
        }
    }
}

# Boucle d'affichage des logs
try {
    while ($true) {
        Show-JobOutput -job $backendJob -color DarkYellow
        Show-JobOutput -job $frontendJob -color DarkCyan
        Start-Sleep -Milliseconds 500
        
        # Verifier si les jobs sont encore actifs
        if ($backendJob.State -eq 'Failed') {
            Write-Host "`n[ERREUR] Le backend s'est arrete de facon inattendue" -ForegroundColor Red
            Receive-Job -Job $backendJob -ErrorAction Continue
            break
        }
        if ($frontendJob.State -eq 'Failed') {
            Write-Host "`n[ERREUR] Le frontend s'est arrete de facon inattendue" -ForegroundColor Red
            Receive-Job -Job $frontendJob -ErrorAction Continue
            break
        }
    }
} catch {
    # Ctrl+C ou autre interruption
} finally {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "   Arret des services..." -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    
    # Arreter les jobs proprement
    if ($backendJob) {
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Backend arrete" -ForegroundColor Green
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Frontend arrete" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "  PostgreSQL reste actif (utilisez 'docker-compose down' pour l'arreter)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  A bientot sur SMART TRIP !" -ForegroundColor Magenta
    Write-Host ""
}
