@echo off
REM Fichier batch pour arrêter TOUT le systeme SMART TRIP (Backend + Frontend + Database)
REM Double-cliquez simplement sur ce fichier pour tout arrêter !

powershell.exe -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"
pause
