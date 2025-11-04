@echo off
REM Fichier batch pour demarrer TOUT le systeme SMART TRIP (Backend + Frontend + Database)
REM Double-cliquez simplement sur ce fichier pour tout lancer !

powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-all.ps1"
pause
