/**
 * Script d'entraînement pour le système de prédiction de prix
 *
 * Ce script effectue plusieurs recherches de vols pour accumuler
 * des données historiques dans la table price_history, permettant
 * ainsi au système d'IA de faire des prédictions précises.
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

// Couleurs pour console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(80));
  log(`  ${title}`, "bold");
  console.log("=".repeat(80) + "\n");
}

// Routes populaires pour l'entraînement
const trainingRoutes = [
  // Routes Europe - USA
  { origin: "PAR", destination: "NYC", name: "Paris → New York" },
  { origin: "PAR", destination: "LAX", name: "Paris → Los Angeles" },
  { origin: "LON", destination: "NYC", name: "Londres → New York" },
  { origin: "MAD", destination: "MIA", name: "Madrid → Miami" },

  // Routes Europe - Asie
  { origin: "PAR", destination: "TYO", name: "Paris → Tokyo" },
  { origin: "LON", destination: "SIN", name: "Londres → Singapour" },
  { origin: "FRA", destination: "BKK", name: "Francfort → Bangkok" },

  // Routes intra-Europe
  { origin: "PAR", destination: "ROM", name: "Paris → Rome" },
  { origin: "PAR", destination: "BCN", name: "Paris → Barcelone" },
  { origin: "LON", destination: "PAR", name: "Londres → Paris" },

  // Routes Europe - Moyen-Orient
  { origin: "PAR", destination: "DXB", name: "Paris → Dubaï" },
  { origin: "LON", destination: "IST", name: "Londres → Istanbul" },

  // Routes Europe - Afrique
  { origin: "PAR", destination: "CAI", name: "Paris → Le Caire" },
  { origin: "PAR", destination: "CMN", name: "Paris → Casablanca" },
];

// Dates de départ pour diversifier les données
const departureDates = [
  "2025-12-01",
  "2025-12-15",
  "2026-01-05",
  "2026-01-20",
  "2026-02-10",
  "2026-02-25",
  "2026-03-15",
  "2026-03-30",
];

// Classes de cabine
const cabinClasses = ["economy", "premium_economy", "business"];

async function performSearch(route, departureDate, cabinClass, index, total) {
  try {
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7); // Séjour de 7 jours

    const searchData = {
      origin: route.origin,
      destination: route.destination,
      departureDate: departureDate,
      returnDate: returnDate.toISOString().split("T")[0],
      adults: Math.floor(Math.random() * 3) + 1, // 1-3 adultes
      cabinClass: cabinClass,
    };

    log(
      `[${index}/${total}] 🔍 ${route.name} | ${departureDate} | ${cabinClass}`,
      "blue"
    );

    const response = await axios.post(
      `${API_BASE}/flights/search`,
      searchData,
      {
        timeout: 30000, // 30 secondes de timeout
      }
    );

    if (response.data.success && response.data.data.flights) {
      const flightCount = response.data.data.flights.length;
      const avgPrice =
        response.data.data.flights.reduce((sum, f) => sum + f.price.total, 0) /
        flightCount;

      log(
        `   ✅ ${flightCount} vols trouvés | Prix moyen: ${avgPrice.toFixed(
          2
        )}€`,
        "green"
      );
      return true;
    } else {
      log(`   ⚠️  Aucun vol trouvé`, "yellow");
      return false;
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      log(`   ❌ Timeout - recherche trop longue`, "red");
    } else if (error.response) {
      log(
        `   ❌ Erreur ${error.response.status}: ${
          error.response.data.message || "Erreur inconnue"
        }`,
        "red"
      );
    } else {
      log(`   ❌ Erreur: ${error.message}`, "red");
    }
    return false;
  }
}

async function trainSystem() {
  logSection("🎓 ENTRAÎNEMENT DU SYSTÈME DE PRÉDICTION DE PRIX");

  log("📊 Configuration de l'entraînement:", "bold");
  log(`   Routes: ${trainingRoutes.length}`, "yellow");
  log(`   Dates: ${departureDates.length}`, "yellow");
  log(`   Classes: ${cabinClasses.length}`, "yellow");

  // Sélectionner un échantillon représentatif
  const samplesPerRoute = 2; // 2 recherches par route
  const totalSearches = trainingRoutes.length * samplesPerRoute;

  log(`   Total de recherches planifiées: ${totalSearches}\n`, "magenta");

  let successCount = 0;
  let failureCount = 0;
  let searchIndex = 0;

  log("🚀 Démarrage de l'entraînement...\n", "bold");

  for (const route of trainingRoutes) {
    // Pour chaque route, on fait 2 recherches avec des dates/classes différentes
    for (let i = 0; i < samplesPerRoute; i++) {
      searchIndex++;

      // Choisir une date et une classe aléatoire
      const randomDate =
        departureDates[Math.floor(Math.random() * departureDates.length)];
      const randomClass =
        cabinClasses[Math.floor(Math.random() * cabinClasses.length)];

      const success = await performSearch(
        route,
        randomDate,
        randomClass,
        searchIndex,
        totalSearches
      );

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Pause entre les recherches pour ne pas surcharger l'API
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 secondes
    }
  }

  logSection("📊 RÉSUMÉ DE L'ENTRAÎNEMENT");

  log(`✅ Recherches réussies: ${successCount}/${totalSearches}`, "green");
  log(
    `❌ Recherches échouées: ${failureCount}/${totalSearches}`,
    failureCount > 0 ? "red" : "green"
  );

  const successRate = ((successCount / totalSearches) * 100).toFixed(1);
  log(
    `📈 Taux de réussite: ${successRate}%`,
    successRate > 70 ? "green" : "yellow"
  );

  if (successCount > 0) {
    log("\n🎉 L'entraînement est terminé !", "bold");
    log(
      "   Le système a maintenant des données historiques pour faire des prédictions.",
      "green"
    );
    log(
      "   Vous pouvez tester les prédictions avec: node test-ai-flight-search.js\n",
      "blue"
    );
  } else {
    log("\n⚠️  Aucune donnée n'a pu être collectée.", "yellow");
    log(
      "   Vérifiez que le serveur est démarré et que l'API Amadeus fonctionne.\n",
      "yellow"
    );
  }
}

// Exécution
if (require.main === module) {
  log("\n" + "█".repeat(80), "magenta");
  log(
    "█                                                                              █",
    "magenta"
  );
  log(
    "█           🎓 ENTRAÎNEMENT DU SYSTÈME DE PRÉDICTION IA - SMART TRIP          █",
    "magenta"
  );
  log(
    "█                                                                              █",
    "magenta"
  );
  log("█".repeat(80), "magenta");

  trainSystem().catch((error) => {
    log(`\n💥 ERREUR FATALE: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}
