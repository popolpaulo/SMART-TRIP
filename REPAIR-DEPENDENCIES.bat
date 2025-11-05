@echo off
REM Script de reparation rapide des dependances npm
REM Lance ce fichier si tu as l'erreur "Cannot find module 'openai'"

echo.
echo ============================================================
echo    SMART TRIP - Reparation des Dependances
echo ============================================================
echo.
echo ATTENTION: Ce script va reinstaller toutes les dependances npm.
echo Cela peut prendre 3-5 minutes.
echo.
pause

powershell.exe -ExecutionPolicy Bypass -File "%~dp0repair-dependencies.ps1"

echo.
echo ============================================================
echo    Reparation terminee
echo ============================================================
echo.
echo Vous pouvez maintenant lancer START-ALL.bat
echo.
pause
