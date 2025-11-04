#!/usr/bin/env pwsh
# Script pour reinitialiser completement l'environnement SMART TRIP

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Red
Write-Host "   SMART TRIP - Reinitialisation complete" -ForegroundColor Red
Write-Host "========================================================" -ForegroundColor Red
Write-Host ""
Write-Host "ATTENTION : Cette action va :" -ForegroundColor Yellow
Write-Host "   - Supprimer tous les conteneurs Docker" -ForegroundColor White
Write-Host "   - Supprimer toutes les donnees de la base de donnees" -ForegroundColor White
Write-Host "   - Supprimer les volumes Docker" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Etes-vous sur de vouloir continuer ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "Operation annulee." -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "Arret et suppression des conteneurs..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "Nettoyage des logs..." -ForegroundColor Yellow
if (Test-Path "logs\*.log") {
    Remove-Item "logs\*.log" -Force
}

Write-Host ""
Write-Host "[OK] Environnement reinitialise" -ForegroundColor Green
Write-Host ""
Write-Host "Pour reconfigurer, lancez : .\setup.ps1" -ForegroundColor Cyan
Write-Host ""
