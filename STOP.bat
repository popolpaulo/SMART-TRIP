@echo off
REM Batch script pour exécuter stop.ps1 (double-clic compatible)

echo ========================================================
echo    SMART TRIP - Arret des services
echo ========================================================
echo.

REM Exécuter le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%~dp0stop.ps1"

echo.
pause
