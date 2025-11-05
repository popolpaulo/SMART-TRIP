# Script de mise a jour automatique des prix des destinations tendances
# Ce script est concu pour etre execute via le Planificateur de taches Windows

# Definir le chemin du projet (utilise le repertoire du script)
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Definir le chemin du fichier de log
$logPath = Join-Path $projectPath "logs"
$logFile = Join-Path $logPath "price-update.log"

# Creer le dossier logs s'il n'existe pas
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}

# Fonction pour ecrire dans le log avec timestamp
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -Append -FilePath $logFile -Encoding UTF8
    Write-Host "$timestamp - $message"
}

# Debut de l'execution
Write-Log "=========================================="
Write-Log "Demarrage de la mise a jour des prix"
Write-Log "=========================================="

try {
    # Changer de repertoire vers le projet
    Set-Location $projectPath
    Write-Log "Repertoire actuel: $projectPath"

    # Verifier que Node.js est disponible
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Node.js detecte: $nodeVersion"
    } else {
        Write-Log "ERREUR: Node.js n'est pas installe ou pas dans le PATH"
        exit 1
    }

    # Verifier que le script existe
    $scriptPath = Join-Path $projectPath "update-trending-prices.js"
    if (-not (Test-Path $scriptPath)) {
        Write-Log "ERREUR: Script update-trending-prices.js introuvable"
        exit 1
    }

    # Executer le script de mise a jour
    Write-Log "Execution du script de mise a jour..."
    $output = node update-trending-prices.js 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Mise a jour terminee avec succes"
        Write-Log "Resultat: $output"
    } else {
        Write-Log "Erreur lors de la mise a jour"
        Write-Log "Erreur: $output"
        exit 1
    }

} catch {
    Write-Log "Exception: $($_.Exception.Message)"
    exit 1
}

Write-Log "=========================================="
Write-Log "Fin de la mise a jour"
Write-Log "=========================================="
Write-Log ""
