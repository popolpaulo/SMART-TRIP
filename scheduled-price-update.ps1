# Script de mise à jour automatique des prix des destinations tendances
# Ce script est conçu pour être exécuté via le Planificateur de tâches Windows

# Définir le chemin du projet
$projectPath = "C:\Users\paulm\OneDrive - ESME\Documents\ESME\Ingé A2 MSI\SMART-TRIP"

# Définir le chemin du fichier de log
$logPath = "$projectPath\logs"
$logFile = "$logPath\price-update.log"

# Créer le dossier logs s'il n'existe pas
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}

# Fonction pour écrire dans le log avec timestamp
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -Append -FilePath $logFile
    Write-Host "$timestamp - $message"
}

# Début de l'exécution
Write-Log "=========================================="
Write-Log "Démarrage de la mise à jour des prix"
Write-Log "=========================================="

try {
    # Changer de répertoire vers le projet
    Set-Location $projectPath
    Write-Log "Répertoire actuel: $projectPath"

    # Vérifier que Node.js est disponible
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Node.js détecté: $nodeVersion"
    } else {
        Write-Log "ERREUR: Node.js n'est pas installé ou pas dans le PATH"
        exit 1
    }

    # Vérifier que le script existe
    $scriptPath = "$projectPath\update-trending-prices.js"
    if (-not (Test-Path $scriptPath)) {
        Write-Log "ERREUR: Script update-trending-prices.js introuvable"
        exit 1
    }

    # Exécuter le script de mise à jour
    Write-Log "Exécution du script de mise à jour..."
    $output = node update-trending-prices.js 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Mise à jour terminée avec succès"
        Write-Log "Résultat: $output"
    } else {
        Write-Log "❌ Erreur lors de la mise à jour"
        Write-Log "Erreur: $output"
        exit 1
    }

} catch {
    Write-Log "❌ Exception: $($_.Exception.Message)"
    exit 1
}

Write-Log "=========================================="
Write-Log "Fin de la mise à jour"
Write-Log "=========================================="
Write-Log ""
