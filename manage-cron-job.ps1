# Script pour gérer la tâche planifiée de mise à jour des prix

$taskName = "SMART-TRIP-UpdatePrices"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Gestion Tâche Planifiée SMART TRIP   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si la tâche existe
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if (-not $task) {
    Write-Host "❌ La tâche '$taskName' n'existe pas" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour l'installer, exécutez:" -ForegroundColor Yellow
    Write-Host "  .\INSTALL-CRON-JOB.bat" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Afficher le statut actuel
$taskInfo = Get-ScheduledTaskInfo -TaskName $taskName
$state = $task.State

Write-Host "📊 STATUT ACTUEL" -ForegroundColor Cyan
Write-Host "   Nom: $taskName" -ForegroundColor Gray
Write-Host "   État: $state" -ForegroundColor $(if ($state -eq "Ready") { "Green" } elseif ($state -eq "Running") { "Yellow" } else { "Red" })
Write-Host "   Dernière exécution: $($taskInfo.LastRunTime)" -ForegroundColor Gray
Write-Host "   Résultat: $($taskInfo.LastTaskResult)" -ForegroundColor $(if ($taskInfo.LastTaskResult -eq 0) { "Green" } else { "Red" })
Write-Host "   Prochaine exécution: $($taskInfo.NextRunTime)" -ForegroundColor Gray
Write-Host ""

# Menu d'actions
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ACTIONS DISPONIBLES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ▶️  Exécuter la tâche maintenant" -ForegroundColor White
Write-Host "2. ⏸️  Désactiver la tâche" -ForegroundColor White
Write-Host "3. ▶️  Activer la tâche" -ForegroundColor White
Write-Host "4. 📊 Voir les logs" -ForegroundColor White
Write-Host "5. 🗑️  Supprimer la tâche" -ForegroundColor White
Write-Host "6. ❌ Quitter" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choisissez une action (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Lancement de la tâche..." -ForegroundColor Cyan
        Start-ScheduledTask -TaskName $taskName
        Write-Host "✅ Tâche lancée !" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Attente de 5 secondes..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "📊 Logs récents:" -ForegroundColor Cyan
        $logFile = "C:\Users\paulm\OneDrive - ESME\Documents\ESME\Ingé A2 MSI\SMART-TRIP\logs\price-update.log"
        if (Test-Path $logFile) {
            Get-Content $logFile -Tail 30
        } else {
            Write-Host "Aucun log trouvé" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "⏸️  Désactivation de la tâche..." -ForegroundColor Yellow
        Disable-ScheduledTask -TaskName $taskName | Out-Null
        Write-Host "✅ Tâche désactivée" -ForegroundColor Green
        Write-Host "   La tâche ne s'exécutera plus automatiquement" -ForegroundColor Gray
    }
    
    "3" {
        Write-Host ""
        Write-Host "▶️  Activation de la tâche..." -ForegroundColor Cyan
        Enable-ScheduledTask -TaskName $taskName | Out-Null
        Write-Host "✅ Tâche activée" -ForegroundColor Green
        Write-Host "   La tâche s'exécutera tous les jours à 2h00" -ForegroundColor Gray
    }
    
    "4" {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host "   LOGS DE MISE À JOUR DES PRIX" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host ""
        $logFile = "C:\Users\paulm\OneDrive - ESME\Documents\ESME\Ingé A2 MSI\SMART-TRIP\logs\price-update.log"
        if (Test-Path $logFile) {
            $lines = Read-Host "Combien de lignes afficher ? (défaut: 50)"
            if ([string]::IsNullOrWhiteSpace($lines)) { $lines = 50 }
            Get-Content $logFile -Tail $lines
        } else {
            Write-Host "❌ Aucun fichier de log trouvé" -ForegroundColor Red
            Write-Host "   Chemin attendu: $logFile" -ForegroundColor Gray
        }
    }
    
    "5" {
        Write-Host ""
        $confirm = Read-Host "⚠️  Êtes-vous sûr de vouloir supprimer la tâche ? (oui/non)"
        if ($confirm -eq "oui") {
            Write-Host ""
            Write-Host "🗑️  Suppression de la tâche..." -ForegroundColor Red
            Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
            Write-Host "✅ Tâche supprimée" -ForegroundColor Green
        } else {
            Write-Host "❌ Annulé" -ForegroundColor Yellow
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "Au revoir !" -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
    }
}

Write-Host ""
pause
