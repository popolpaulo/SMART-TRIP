#!/usr/bin/env pwsh
# Script de reparation des dependances npm pour SMART TRIP
# Lance ce script si tu as l'erreur "Cannot find module 'openai'"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Reparation des Dependances" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$workspaceRoot = $PSScriptRoot
$frontendPath = Join-Path $workspaceRoot "frontend"

# ============================================================
# Arreter les processus Node.js en cours
# ============================================================
Write-Host "Arret des processus Node.js existants..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "  [OK] Processus arretes" -ForegroundColor Green
Write-Host ""

# ============================================================
# Reparer le Backend
# ============================================================
Write-Host "Reparation des dependances Backend..." -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

Push-Location $workspaceRoot

# Verifier les modules critiques
$criticalModules = @("openai", "express", "pg", "cors", "dotenv", "bcryptjs", "jsonwebtoken", "winston")
$missingModules = @()

foreach ($module in $criticalModules) {
    if (-not (Test-Path "node_modules\$module")) {
        $missingModules += $module
    }
}

if ($missingModules.Count -gt 0) {
    Write-Host "  Modules manquants detectes: $($missingModules -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Reinstallation complete des dependances..." -ForegroundColor Cyan
    Write-Host "  (Cela peut prendre 2-3 minutes)" -ForegroundColor Gray
    Write-Host ""
    
    # Supprimer node_modules et package-lock.json pour repartir de zero
    if (Test-Path "node_modules") {
        Write-Host "  Suppression de l'ancien node_modules..." -ForegroundColor Yellow
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    # Reinstaller
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  [OK] Dependances Backend reparees avec succes !" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  [ERREUR] Echec de la reparation" -ForegroundColor Red
        Write-Host "  Essayez manuellement:" -ForegroundColor Yellow
        Write-Host "    1. Supprimez le dossier node_modules" -ForegroundColor White
        Write-Host "    2. Lancez: npm install" -ForegroundColor White
        Pop-Location
        exit 1
    }
} else {
    Write-Host "  [OK] Tous les modules critiques sont presents" -ForegroundColor Green
}

Pop-Location
Write-Host ""

# ============================================================
# Reparer le Frontend
# ============================================================
Write-Host "Reparation des dependances Frontend..." -ForegroundColor Magenta
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

Push-Location $frontendPath

# Verifier les modules critiques
$criticalModules = @("react", "react-dom", "vite", "react-router-dom", "axios", "lucide-react")
$missingModules = @()

foreach ($module in $criticalModules) {
    if (-not (Test-Path "node_modules\$module")) {
        $missingModules += $module
    }
}

if ($missingModules.Count -gt 0) {
    Write-Host "  Modules manquants detectes: $($missingModules -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Reinstallation complete des dependances..." -ForegroundColor Cyan
    Write-Host "  (Cela peut prendre 2-3 minutes)" -ForegroundColor Gray
    Write-Host ""
    
    # Supprimer node_modules et package-lock.json
    if (Test-Path "node_modules") {
        Write-Host "  Suppression de l'ancien node_modules..." -ForegroundColor Yellow
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    # Reinstaller
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  [OK] Dependances Frontend reparees avec succes !" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "  [ERREUR] Echec de la reparation" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Host "  [OK] Tous les modules critiques sont presents" -ForegroundColor Green
}

Pop-Location
Write-Host ""

# ============================================================
# RESUME
# ============================================================
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   REPARATION TERMINEE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Vous pouvez maintenant relancer START-ALL.bat" -ForegroundColor White
Write-Host ""
Write-Host "  Si l'erreur persiste, verifiez:" -ForegroundColor Yellow
Write-Host "    1. Que vous etes bien dans le dossier SMART-TRIP" -ForegroundColor Gray
Write-Host "    2. Que Node.js est installe: node --version" -ForegroundColor Gray
Write-Host "    3. Le fichier package.json existe a la racine" -ForegroundColor Gray
Write-Host ""
