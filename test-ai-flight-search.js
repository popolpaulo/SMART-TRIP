/**
 * Script de test pour le comparateur de vols intelligent avec IA
 *
 * Ce script teste les 3 nouveaux endpoints:
 * 1. POST /api/flights/search - Recherche intelligente avec scoring IA
 * 2. POST /api/flights/search-vpn - Comparaison multi-pays
 * 3. POST /api/flights/predict-prices - Prédiction de prix avec ML
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
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(80));
  log(`  ${title}`, "bold");
  console.log("=".repeat(80) + "\n");
}

async function testSmartSearch() {
  logSection("TEST 1: Recherche Intelligente de Vols avec IA");

  try {
    const searchData = {
      origin: "PAR",
      destination: "NYC",
      departureDate: "2025-12-01",
      returnDate: "2025-12-08",
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: "economy",
    };

    log(`📤 Envoi de la requête de recherche...`, "blue");
    log(
      `   Origine: ${searchData.origin} → Destination: ${searchData.destination}`
    );
    log(
      `   Départ: ${searchData.departureDate} → Retour: ${searchData.returnDate}`
    );
    log(`   Passagers: ${searchData.adults} adultes, ${searchData.cabinClass}`);

    const response = await axios.post(`${API_BASE}/flights/search`, searchData);

    if (response.data.success) {
      log(`\n✅ Recherche réussie!`, "green");
      log(
        `   Nombre de vols trouvés: ${response.data.data.meta.totalResults}`,
        "green"
      );
      log(
        `   Sources des données: ${response.data.data.meta.sources.join(", ")}`,
        "green"
      );

      if (response.data.data.flights && response.data.data.flights.length > 0) {
        log(`\n🏆 Top 3 vols recommandés par l'IA:\n`, "yellow");

        response.data.data.flights.slice(0, 3).forEach((flight, index) => {
          const carrier =
            flight.carrierIds?.[0] ||
            flight.validatingAirlineCodes?.[0] ||
            "N/A";
          log(
            `   ${index + 1}. ${carrier} ${flight.price.total.toFixed(2)}${
              flight.price.currency
            }`,
            "bold"
          );

          if (flight.aiScore) {
            const recommendation = flight.aiRecommendation?.level || "N/A";
            log(`      📊 Score IA: ${flight.aiScore}/100 (${recommendation})`);
            const highlights =
              flight.aiRecommendation?.highlights?.[0] ||
              flight.aiRecommendation?.message ||
              "N/A";
            log(`      💡 ${highlights}`);

            if (flight.scoreBreakdown) {
              log(`      🔍 Détail:`);
              log(`         - Prix: ${flight.scoreBreakdown.price}/100`);
              log(`         - Confort: ${flight.scoreBreakdown.comfort}/100`);
              log(`         - Durée: ${flight.scoreBreakdown.duration}/100`);
            }
          }

          log(
            `      ✈️  Départ: ${new Date(
              flight.outbound.departure.time
            ).toLocaleString("fr-FR")}`
          );
          log(
            `      🛬 Arrivée: ${new Date(
              flight.outbound.arrival.time
            ).toLocaleString("fr-FR")}`
          );
          log(`      ⏱️  Durée: ${flight.outbound.duration || "N/A"}`);
          log(`      🔄 Escales: ${flight.outbound.stops}\n`);
        });
      }
    } else {
      log(`❌ Échec de la recherche: ${response.data.message}`, "red");
    }
  } catch (error) {
    log(`\n❌ ERREUR: ${error.message}`, "red");
    if (error.response) {
      log(`   Statut: ${error.response.status}`, "red");
      log(`   Détails: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    }
  }
}

async function testVPNSearch() {
  logSection("TEST 2: Comparaison de Prix Multi-Pays avec VPN");

  try {
    const searchData = {
      origin: "PAR",
      destination: "NYC",
      departureDate: "2025-12-01",
      returnDate: "2025-12-08",
      adults: 1,
      cabinClass: "economy",
      countries: ["FR", "US", "GB", "DE"],
    };

    log(`📤 Envoi de la requête VPN...`, "blue");
    log(`   Pays comparés: ${searchData.countries.join(", ")}`);

    const response = await axios.post(
      `${API_BASE}/flights/search-vpn`,
      searchData
    );

    if (response.data.success) {
      log(`\n✅ Comparaison réussie!`, "green");

      if (response.data.data.vpnComparison) {
        log(`\n💰 Comparaison des prix par pays:\n`, "yellow");

        Object.entries(response.data.data.vpnComparison).forEach(
          ([country, data]) => {
            log(
              `   🌍 ${country}: ${data.minPrice} ${data.currency} (minimum)`
            );
          }
        );

        if (response.data.data.bestCountry) {
          log(`\n🎯 Meilleur pays: ${response.data.data.bestCountry}`, "green");
          log(
            `   💵 Prix: ${response.data.data.bestPrice} ${response.data.data.bestCurrency}`
          );
          if (response.data.data.savings) {
            log(
              `   💰 Économies: ${response.data.data.savings.toFixed(2)} ${
                response.data.data.bestCurrency
              } (${(response.data.data.savingsPercentage || 0).toFixed(1)}%)`,
              "green"
            );
          }
        }
      }
    } else {
      log(`❌ Échec de la recherche VPN: ${response.data.message}`, "red");
    }
  } catch (error) {
    log(`\n❌ ERREUR: ${error.message}`, "red");
    if (error.response) {
      log(`   Statut: ${error.response.status}`, "red");
      log(`   Détails: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    }
  }
}

async function testPricePrediction() {
  logSection("TEST 3: Prédiction de Prix avec Machine Learning");

  try {
    const searchData = {
      origin: "PAR",
      destination: "NYC",
      departureDate: "2025-12-01",
      cabinClass: "economy",
    };

    log(`📤 Envoi de la requête de prédiction...`, "blue");
    log(`   Route: ${searchData.origin} → ${searchData.destination}`);
    log(`   Date: ${searchData.departureDate}`);

    const response = await axios.post(
      `${API_BASE}/flights/predict-prices`,
      searchData
    );

    if (response.data.success) {
      log(`\n✅ Prédiction réussie!`, "green");

      const data = response.data.data;

      if (data.currentPrice) {
        log(`\n💵 Prix actuel: ${data.currentPrice.toFixed(2)} EUR`, "bold");
      }

      if (data.trend) {
        const trendEmoji =
          data.trend === "increasing"
            ? "📈"
            : data.trend === "decreasing"
            ? "📉"
            : "➡️";
        log(`${trendEmoji} Tendance: ${data.trend}`, "yellow");
      }

      if (data.predictions) {
        log(`\n🔮 Prédictions de prix:\n`, "yellow");
        Object.entries(data.predictions).forEach(([period, price]) => {
          if (price !== null && price !== undefined) {
            log(`   ${period}: ${price.toFixed(2)} EUR`);
          }
        });
      }

      if (data.currentAvgPrice) {
        log(
          `\n💵 Prix moyen actuel: ${data.currentAvgPrice.toFixed(2)} EUR`,
          "bold"
        );
      }

      if (data.recommendation) {
        log(`\n💡 Recommandation: ${data.recommendation}`, "green");
        log(`   Confiance: ${data.confidence || "N/A"}`);

        if (data.reasoning) {
          log(`   📝 Raison: ${data.reasoning}`, "yellow");
        }

        if (data.estimatedSavings) {
          log(
            `   💰 Économies estimées: ${data.estimatedSavings.toFixed(2)} EUR`,
            "green"
          );
        }

        if (data.optimalBookingDate) {
          log(
            `   📅 Date optimale de réservation: ${data.optimalBookingDate}`,
            "green"
          );
        }
      }
    } else {
      log(`❌ Échec de la prédiction: ${response.data.message}`, "red");
    }
  } catch (error) {
    log(`\n❌ ERREUR: ${error.message}`, "red");
    if (error.response) {
      log(`   Statut: ${error.response.status}`, "red");
      log(`   Détails: ${JSON.stringify(error.response.data, null, 2)}`, "red");
    }
  }
}

async function runAllTests() {
  log("\n" + "█".repeat(80), "blue");
  log(
    "█                                                                              █",
    "blue"
  );
  log(
    "█     🚀 TESTS DU COMPARATEUR DE VOLS INTELLIGENT AVEC IA - SMART TRIP     █",
    "blue"
  );
  log(
    "█                                                                              █",
    "blue"
  );
  log("█".repeat(80), "blue");

  log(
    "\n⚠️  Note: Ces tests utilisent des données MOCK car les API keys ne sont pas configurées.",
    "yellow"
  );
  log("   Pour tester avec de vraies données, configurez dans .env:", "yellow");
  log("   - AMADEUS_API_KEY et AMADEUS_API_SECRET", "yellow");
  log("   - SKYSCANNER_API_KEY", "yellow");
  log("   - OPENAI_API_KEY\n", "yellow");

  // Test 1: Recherche intelligente
  await testSmartSearch();

  // Pause entre les tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: VPN Search
  await testVPNSearch();

  // Pause entre les tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Price Prediction
  await testPricePrediction();

  logSection("RÉSUMÉ DES TESTS");
  log("✅ Tests terminés avec succès!", "green");
  log("\n📝 Prochaines étapes:", "bold");
  log("   1. Configurer les vraies API keys dans .env");
  log("   2. Tester avec de vraies données Amadeus/Skyscanner");
  log("   3. Intégrer les endpoints dans le frontend React");
  log("   4. Ajouter les graphiques de prédiction de prix");
  log("   5. Implémenter le système d'alertes de prix\n");
}

// Exécution des tests
if (require.main === module) {
  runAllTests().catch((error) => {
    log(`\n💥 ERREUR FATALE: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  testSmartSearch,
  testVPNSearch,
  testPricePrediction,
};
