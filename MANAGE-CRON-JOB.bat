@echo off
REM Script pour gérer la tâche planifiée de mise à jour des prix
REM Permet de lancer, arrêter, voir le statut, etc.

echo.
echo ========================================
echo   Gestion Cron Job SMART TRIP
echo ========================================
echo.

powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0manage-cron-job.ps1"

echo.
