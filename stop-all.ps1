#!/usr/bin/env pwsh
# Script pour arrêter TOUT le système SMART TRIP (Backend + Frontend + Database)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Arrêt complet du système" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "SilentlyContinue"

# Arrêter tous les processus Node.js
Write-Host "➜ Arrêt des serveurs Node.js (Backend + Frontend)..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  [OK] Serveurs Node.js arrêtés ($($nodeProcesses.Count) processus)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Aucun serveur Node.js en cours d'exécution" -ForegroundColor Gray
}

# Arrêter Docker Compose
Write-Host "➜ Arrêt de Docker Compose (PostgreSQL + PgAdmin)..." -ForegroundColor Yellow
try {
    docker-compose down 2>&1 | Out-Null
    Write-Host "  [OK] Conteneurs Docker arrêtés" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Conteneurs Docker déjà arrêtés" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   ✅ Tous les services ont été arrêtés avec succès !" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
