#!/usr/bin/env pwsh
# Script pour arreter proprement tous les services SMART TRIP

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SMART TRIP - Arret des services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Arret des conteneurs Docker..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "[OK] Services arretes avec succes" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer, utilisez : .\start.ps1" -ForegroundColor Cyan
Write-Host ""
