#!/usr/bin/env pwsh
# Script de diagnostic pour SMART TRIP
# Lance ce script pour verifier que tout est configure correctement

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Diagnostic de Configuration" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$workspaceRoot = $PSScriptRoot
$frontendPath = Join-Path $workspaceRoot "frontend"

# ============================================================
# 1. Verifier la version du script
# ============================================================
Write-Host "1. Version du script de demarrage" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

$startAllPath = Join-Path $workspaceRoot "start-all.ps1"
if (Test-Path $startAllPath) {
    $content = Get-Content $startAllPath -Raw
    if ($content -match "Version: 2\.0") {
        Write-Host "   [OK] Version 2.0 (avec auto-installation)" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Version obsolete detectee !" -ForegroundColor Red
        Write-Host "   Action requise: git pull origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERREUR] start-all.ps1 introuvable !" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 2. Verifier Git
# ============================================================
Write-Host "2. Git et Synchronisation" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Depot Git valide" -ForegroundColor Green
        
        # Verifier si a jour avec origin
        git fetch origin main 2>$null | Out-Null
        $behind = git rev-list HEAD..origin/main --count 2>$null
        if ($behind -gt 0) {
            Write-Host "   [ATTENTION] $behind commits en retard sur origin/main" -ForegroundColor Yellow
            Write-Host "   Action requise: git pull origin main" -ForegroundColor Yellow
        } else {
            Write-Host "   [OK] A jour avec origin/main" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   [ERREUR] Git n'est pas configure" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 3. Verifier Node.js et npm
# ============================================================
Write-Host "3. Node.js et npm" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Node.js $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Node.js non installe" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERREUR] Node.js non installe" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] npm $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] npm non installe" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERREUR] npm non installe" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 4. Verifier les dependances Backend
# ============================================================
Write-Host "4. Dependances Backend" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

$backendNodeModules = Join-Path $workspaceRoot "node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host "   [OK] node_modules existe" -ForegroundColor Green
    
    # Verifier quelques packages critiques
    $openai = Join-Path $backendNodeModules "openai"
    $express = Join-Path $backendNodeModules "express"
    $pg = Join-Path $backendNodeModules "pg"
    
    if (Test-Path $openai) {
        Write-Host "   [OK] openai installe" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] openai manquant !" -ForegroundColor Red
        Write-Host "   Action requise: npm install" -ForegroundColor Yellow
    }
    
    if (Test-Path $express) {
        Write-Host "   [OK] express installe" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] express manquant !" -ForegroundColor Red
    }
    
    if (Test-Path $pg) {
        Write-Host "   [OK] pg (PostgreSQL) installe" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] pg manquant !" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERREUR] node_modules manquant !" -ForegroundColor Red
    Write-Host "   Action requise: npm install" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================
# 5. Verifier les dependances Frontend
# ============================================================
Write-Host "5. Dependances Frontend" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

$frontendNodeModules = Join-Path $frontendPath "node_modules"
if (Test-Path $frontendNodeModules) {
    Write-Host "   [OK] frontend/node_modules existe" -ForegroundColor Green
    
    # Verifier quelques packages critiques
    $react = Join-Path $frontendNodeModules "react"
    $vite = Join-Path $frontendNodeModules "vite"
    
    if (Test-Path $react) {
        Write-Host "   [OK] react installe" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] react manquant !" -ForegroundColor Red
    }
    
    if (Test-Path $vite) {
        Write-Host "   [OK] vite installe" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] vite manquant !" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERREUR] frontend/node_modules manquant !" -ForegroundColor Red
    Write-Host "   Action requise: cd frontend && npm install" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================
# 6. Verifier Docker
# ============================================================
Write-Host "6. Docker" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

try {
    docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $dockerVersion = docker --version
        Write-Host "   [OK] $dockerVersion" -ForegroundColor Green
        
        # Verifier si PostgreSQL tourne
        $pgRunning = docker ps --filter "name=smarttrip_db" --format "{{.Names}}" 2>$null
        if ($pgRunning -eq "smarttrip_db") {
            Write-Host "   [OK] PostgreSQL container actif" -ForegroundColor Green
        } else {
            Write-Host "   [INFO] PostgreSQL container non demarre" -ForegroundColor Yellow
            Write-Host "   (Normal si vous n'avez pas encore lance START-ALL.bat)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   [ERREUR] Docker ne repond pas" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERREUR] Docker non installe ou non demarre" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 7. Verifier le fichier .env
# ============================================================
Write-Host "7. Configuration (.env)" -ForegroundColor Magenta
Write-Host "   ------------------------------------------------" -ForegroundColor DarkGray

$envFile = Join-Path $workspaceRoot ".env"
if (Test-Path $envFile) {
    Write-Host "   [OK] .env existe" -ForegroundColor Green
    
    # Verifier quelques variables critiques
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DB_HOST") {
        Write-Host "   [OK] DB_HOST configure" -ForegroundColor Green
    }
    if ($envContent -match "JWT_SECRET") {
        Write-Host "   [OK] JWT_SECRET configure" -ForegroundColor Green
    }
    if ($envContent -match "AMADEUS_API_KEY") {
        if ($envContent -match "AMADEUS_API_KEY=your_amadeus_api_key") {
            Write-Host "   [ATTENTION] AMADEUS_API_KEY a configurer" -ForegroundColor Yellow
        } else {
            Write-Host "   [OK] AMADEUS_API_KEY configure" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   [INFO] .env absent (sera cree automatiquement)" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================
# RESUME ET RECOMMANDATIONS
# ============================================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   RESUME ET ACTIONS RECOMMANDEES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()

# Verifier les problemes critiques
if (-not (Test-Path $backendNodeModules)) {
    $issues += "Les dependances Backend ne sont pas installees"
}

if (-not (Test-Path $frontendNodeModules)) {
    $issues += "Les dependances Frontend ne sont pas installees"
}

try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $issues += "Docker n'est pas demarre"
    }
} catch {
    $issues += "Docker n'est pas installe"
}

if ($issues.Count -eq 0) {
    Write-Host "  Tout semble correct ! Vous pouvez lancer START-ALL.bat" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "  PROBLEMES DETECTES:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "    - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "  SOLUTION AUTOMATIQUE:" -ForegroundColor Cyan
    Write-Host "    1. Assurez-vous que Docker Desktop est demarre" -ForegroundColor White
    Write-Host "    2. Lancez START-ALL.bat" -ForegroundColor White
    Write-Host "    3. Le script installera automatiquement les dependances manquantes" -ForegroundColor White
    Write-Host ""
}

Write-Host "  Pour plus d'aide, consultez INSTRUCTIONS_COLLEGUE.md" -ForegroundColor Gray
Write-Host ""
