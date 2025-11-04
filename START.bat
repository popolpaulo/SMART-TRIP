@echo off
REM Batch script pour exécuter start.ps1 (double-clic compatible)

echo ========================================================
echo    SMART TRIP - Demarrage du serveur
echo ========================================================
echo.

REM Exécuter le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start.ps1"

pause
