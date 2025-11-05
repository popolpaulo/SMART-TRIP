@echo off
REM Installation de la tâche planifiée pour la mise à jour automatique des prix
REM Ce script doit être exécuté en tant qu'administrateur

echo.
echo ========================================
echo   Installation Cron Job SMART TRIP
echo   Mise a jour automatique des prix
echo ========================================
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERREUR] Ce script doit etre execute en tant qu'administrateur
    echo.
    echo Clic droit sur le fichier ^> "Executer en tant qu'administrateur"
    echo.
    pause
    exit /b 1
)

echo [INFO] Execution en tant qu'administrateur : OK
echo.

REM Exécuter le script PowerShell d'installation
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0install-cron-job.ps1"

echo.
pause
