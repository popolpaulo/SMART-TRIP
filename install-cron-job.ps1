# Script installation tache planifiee mise a jour des prix
# A executer en tant qu'administrateur

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Installation de la tache planifiee   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier privileges administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERREUR: Executer en tant qu'administrateur" -ForegroundColor Red
    pause
    exit 1
}

# Configuration
$taskName = "SMART-TRIP-UpdatePrices"
$projectPath = $PSScriptRoot
$scriptPath = Join-Path $projectPath "scheduled-price-update.ps1"

Write-Host "Chemin du projet: $projectPath" -ForegroundColor Gray
Write-Host "Script: $scriptPath" -ForegroundColor Gray
Write-Host ""

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERREUR: Script introuvable" -ForegroundColor Red
    pause
    exit 1
}

# Supprimer tache existante
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Ancienne tache supprimee" -ForegroundColor Yellow
}

# Creer action
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$scriptPath`"" -WorkingDirectory $projectPath

# Creer declencheur  
$trigger = New-ScheduledTaskTrigger -Daily -At 2AM

# Creer parametres
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopOnIdleEnd

# Creer tache
Write-Host "Creation tache planifiee..." -ForegroundColor Cyan

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Mise a jour prix SMART TRIP" -User "SYSTEM" -RunLevel Highest -Force | Out-Null

    Write-Host "Tache creee avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nom: $taskName" -ForegroundColor White
    Write-Host "Execution: Tous les jours a 2h00" -ForegroundColor White
    Write-Host ""
    
    # Test
    $test = Read-Host "Tester maintenant ? (o/n)"
    
    if ($test -eq "o") {
        Write-Host ""
        Write-Host "Lancement..." -ForegroundColor Cyan
        Start-ScheduledTask -TaskName $taskName
        Write-Host "Tache lancee !" -ForegroundColor Green
        Write-Host ""
        Start-Sleep -Seconds 3
        
        $logFile = "$projectPath\logs\price-update.log"
        if (Test-Path $logFile) {
            Write-Host "Logs:" -ForegroundColor Cyan
            Get-Content $logFile -Tail 20
        }
    }
    
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "INSTALLATION TERMINEE !" -ForegroundColor Green
Write-Host "Prix mis a jour automatiquement tous les jours" -ForegroundColor Green
Write-Host ""
pause
