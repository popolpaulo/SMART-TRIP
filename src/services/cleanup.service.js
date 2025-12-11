const db = require('../database/connection');
const logger = require('../utils/logger');

/**
 * Service de nettoyage automatique des comptes non vérifiés
 */

// Supprimer les comptes non vérifiés après 15 minutes
async function deleteUnverifiedAccounts() {
  try {
    logger.debug('Exécution du nettoyage des comptes non vérifiés...');
    
    const result = await db.query(
      `DELETE FROM users 
       WHERE email_verified = FALSE 
       AND created_at < NOW() - INTERVAL '15 minutes'
       RETURNING email`,
    );

    if (result.rows.length > 0) {
      logger.info(`🗑️  Suppression de ${result.rows.length} compte(s) non vérifié(s):`);
      result.rows.forEach(row => logger.info(`   - ${row.email}`));
    } else {
      logger.debug('Aucun compte à supprimer');
    }

    return result.rows.length;
  } catch (error) {
    logger.error('Erreur lors du nettoyage des comptes non vérifiés:', error);
    return 0;
  }
}

// Démarrer le nettoyage automatique toutes les 5 minutes
function startCleanupScheduler() {
  // Exécution immédiate au démarrage
  deleteUnverifiedAccounts();

  // Puis toutes les 5 minutes
  setInterval(async () => {
    await deleteUnverifiedAccounts();
  }, 5 * 60 * 1000); // 5 minutes

  logger.info('🕐 Planificateur de nettoyage des comptes démarré (toutes les 5 minutes)');
}

module.exports = {
  deleteUnverifiedAccounts,
  startCleanupScheduler,
};
