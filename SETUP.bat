@echo off
REM Batch script pour exécuter setup.ps1 (double-clic compatible)

echo ========================================================
echo    SMART TRIP - Installation automatique
echo ========================================================
echo.
echo Demarrage de l'installation...
echo.

REM Exécuter le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

echo.
echo.
pause
