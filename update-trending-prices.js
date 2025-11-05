/**
 * Script pour mettre à jour les prix réels des destinations tendances
 *
 * Usage:
 *   node train-price-prediction.js         - Met à jour toutes les destinations depuis Paris (CDG)
 *   node train-price-prediction.js JFK     - Met à jour toutes depuis New York (JFK)
 *
 * Ce script doit être exécuté :
 * - Manuellement après le seed initial
 * - Via cron job quotidien (recommandé: 2h du matin)
 * - Après l'ajout de nouvelles destinations
 */

require("dotenv").config();
const trendingPriceUpdater = require("./src/services/trending-price-updater.service");
const logger = require("./src/utils/logger");

async function main() {
  try {
    // Récupérer l'aéroport d'origine depuis les arguments (CDG par défaut)
    const originAirport = process.argv[2] || "CDG";

    logger.info("=".repeat(60));
    logger.info("🚀 Démarrage de la mise à jour des prix des destinations");
    logger.info(`📍 Aéroport d'origine: ${originAirport}`);
    logger.info("=".repeat(60));
    logger.info("");

    // Lancer la mise à jour
    const result = await trendingPriceUpdater.updateAllPrices(originAirport);

    logger.info("");
    logger.info("=".repeat(60));
    logger.info("📊 RÉSULTATS DE LA MISE À JOUR");
    logger.info("=".repeat(60));
    logger.info(
      `✅ Destinations mises à jour: ${result.updated}/${result.total}`
    );
    logger.info(`❌ Erreurs: ${result.errors}`);
    logger.info(
      `📈 Taux de succès: ${((result.updated / result.total) * 100).toFixed(
        1
      )}%`
    );
    logger.info("=".repeat(60));
    logger.info("");

    if (result.updated > 0) {
      logger.info(
        "✅ Les prix affichés sur la page d'accueil sont maintenant à jour !"
      );
      logger.info(
        "💡 Pensez à exécuter ce script régulièrement (cron job recommandé)"
      );
    } else {
      logger.warn(
        "⚠️ Aucune destination n'a été mise à jour. Vérifiez les logs ci-dessus."
      );
    }

    process.exit(0);
  } catch (error) {
    logger.error("❌ Erreur fatale:", error);
    process.exit(1);
  }
}

// Lancement du script
main();
