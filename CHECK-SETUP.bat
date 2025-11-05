@echo off
REM Script de diagnostic pour SMART TRIP
REM Lance ce fichier pour verifier que tout est correctement configure

echo.
echo ============================================================
echo    SMART TRIP - Diagnostic de Configuration
echo ============================================================
echo.
echo Lancement du diagnostic...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0check-setup.ps1"

echo.
echo ============================================================
echo    Diagnostic termine
echo ============================================================
echo.
pause
