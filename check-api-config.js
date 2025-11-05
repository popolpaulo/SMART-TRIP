/**
 * Script de vérification de la configuration des API keys
 * Teste si les clés sont bien configurées et fonctionnelles
 */

require("dotenv").config();
const axios = require("axios");

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

async function checkAmadeusConfig() {
  logSection("1. VÉRIFICATION AMADEUS API");

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  const baseUrl = process.env.AMADEUS_BASE_URL;

  log(`📋 Configuration actuelle:`, "blue");
  log(
    `   API Key: ${
      apiKey
        ? apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4)
        : "❌ NON CONFIGURÉ"
    }`
  );
  log(
    `   API Secret: ${
      apiSecret
        ? "✅ Configuré (" + apiSecret.length + " chars)"
        : "❌ NON CONFIGURÉ"
    }`
  );
  log(`   Base URL: ${baseUrl || "❌ NON CONFIGURÉ"}`);

  if (
    !apiKey ||
    apiKey === "REMPLACEZ_PAR_VOTRE_CLE_AMADEUS" ||
    apiKey === "votre_cle_amadeus"
  ) {
    log("\n❌ Amadeus API NON CONFIGURÉE", "red");
    log("   Le système utilisera des données MOCK", "yellow");
    log("\n💡 Pour configurer:", "blue");
    log("   1. Créer un compte sur https://developers.amadeus.com/register");
    log('   2. Créer une application "Self-Service"');
    log("   3. Copier API Key et API Secret");
    log("   4. Mettre à jour le fichier .env");
    log("   5. Redémarrer le serveur");
    return false;
  }

  // Tester la connexion
  log("\n🔍 Test de connexion à Amadeus...", "blue");
  try {
    const response = await axios.post(
      `${baseUrl}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (response.data.access_token) {
      log("✅ CONNEXION RÉUSSIE !", "green");
      log(
        `   Token reçu: ${response.data.access_token.substring(0, 20)}...`,
        "green"
      );
      log(`   Expire dans: ${response.data.expires_in} secondes`, "green");
      log(`   Type: ${response.data.type}`, "green");
      return true;
    }
  } catch (error) {
    log("❌ ÉCHEC DE CONNEXION", "red");
    if (error.response) {
      log(`   Statut: ${error.response.status}`, "red");
      log(`   Erreur: ${error.response.data?.error || "Unknown"}`, "red");
      log(
        `   Description: ${error.response.data?.error_description || "N/A"}`,
        "red"
      );
    } else {
      log(`   Erreur: ${error.message}`, "red");
    }
    log("\n💡 Vérifiez que:", "yellow");
    log("   - L'API Key est correcte", "yellow");
    log("   - L'API Secret est correct", "yellow");
    log("   - L'URL de base est correcte (test vs production)", "yellow");
    return false;
  }
}

async function checkOpenAIConfig() {
  logSection("2. VÉRIFICATION OPENAI API");

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4";
  const enabled = process.env.AI_PREDICTION_ENABLED === "true";

  log(`📋 Configuration actuelle:`, "blue");
  log(
    `   API Key: ${
      apiKey
        ? apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4)
        : "❌ NON CONFIGURÉ"
    }`
  );
  log(`   Modèle: ${model}`);
  log(`   Activé: ${enabled ? "✅ OUI" : "❌ NON"}`);

  if (
    !apiKey ||
    apiKey === "REMPLACEZ_PAR_VOTRE_CLE_OPENAI" ||
    apiKey === "votre_cle_openai"
  ) {
    log("\n⚠️  OpenAI API NON CONFIGURÉE", "yellow");
    log("   Le système utilisera le fallback statistique (gratuit)", "yellow");
    log("\n💡 Pour activer les prédictions IA avec GPT-4:", "blue");
    log("   1. Créer un compte sur https://platform.openai.com/signup");
    log("   2. Ajouter un moyen de paiement");
    log("   3. Générer une API key");
    log("   4. Mettre à jour OPENAI_API_KEY dans .env");
    log("   5. Coût estimé: ~$0.03 par prédiction");
    return false;
  }

  if (!enabled) {
    log("\n⚠️  Prédictions IA DÉSACTIVÉES", "yellow");
    log(
      "   Modifier AI_PREDICTION_ENABLED=true dans .env pour activer",
      "yellow"
    );
    return false;
  }

  // Tester la connexion (simple check)
  log("\n🔍 Test de connexion à OpenAI...", "blue");
  try {
    const response = await axios.get("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.data.data) {
      log("✅ CONNEXION RÉUSSIE !", "green");
      const gpt4Available = response.data.data.some((m) => m.id === "gpt-4");
      log(
        `   GPT-4 disponible: ${gpt4Available ? "✅ OUI" : "❌ NON"}`,
        gpt4Available ? "green" : "red"
      );
      log(
        `   Nombre de modèles accessibles: ${response.data.data.length}`,
        "green"
      );

      if (!gpt4Available) {
        log("\n⚠️  GPT-4 non accessible avec cette clé", "yellow");
        log("   Vérifiez que votre compte OpenAI a accès à GPT-4", "yellow");
        log(
          "   Alternative: utiliser gpt-3.5-turbo (10x moins cher)",
          "yellow"
        );
      }

      return true;
    }
  } catch (error) {
    log("❌ ÉCHEC DE CONNEXION", "red");
    if (error.response) {
      log(`   Statut: ${error.response.status}`, "red");
      log(
        `   Erreur: ${error.response.data?.error?.message || "Unknown"}`,
        "red"
      );
    } else {
      log(`   Erreur: ${error.message}`, "red");
    }
    log("\n💡 Vérifiez que:", "yellow");
    log('   - La clé API commence par "sk-"', "yellow");
    log("   - Vous avez ajouté un moyen de paiement sur OpenAI", "yellow");
    log("   - La clé n'a pas été révoquée", "yellow");
    return false;
  }
}

async function checkSkyscannerConfig() {
  logSection("3. VÉRIFICATION SKYSCANNER API (Optionnel)");

  const apiKey = process.env.SKYSCANNER_API_KEY;

  log(`📋 Configuration actuelle:`, "blue");
  log(`   API Key: ${apiKey ? "✅ Configuré" : "❌ NON CONFIGURÉ"}`);

  if (!apiKey || apiKey === "REMPLACEZ_PAR_VOTRE_CLE_SKYSCANNER") {
    log("\n⚠️  Skyscanner API NON CONFIGURÉE", "yellow");
    log("   ℹ️  Cette API est OPTIONNELLE", "blue");
    log("   Le système fonctionne parfaitement avec Amadeus seul", "blue");
    log("\n💡 Si vous voulez l'ajouter:", "blue");
    log("   1. S'inscrire sur https://partners.skyscanner.net/sign-up");
    log("   2. Attendre l'approbation (3-7 jours)");
    log("   3. Alternative: RapidAPI Skyscanner (plus rapide)", "blue");
    return false;
  }

  log("\n✅ Skyscanner API configurée", "green");
  log("   Note: Impossible de tester sans faire une vraie requête", "yellow");
  return true;
}

async function checkOverallStatus() {
  logSection("RÉSUMÉ DE LA CONFIGURATION");

  const amadeusOk =
    process.env.AMADEUS_API_KEY &&
    process.env.AMADEUS_API_KEY !== "REMPLACEZ_PAR_VOTRE_CLE_AMADEUS" &&
    process.env.AMADEUS_API_KEY !== "votre_cle_amadeus";

  const openaiOk =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "REMPLACEZ_PAR_VOTRE_CLE_OPENAI" &&
    process.env.OPENAI_API_KEY !== "votre_cle_openai";

  const skyscannerOk =
    process.env.SKYSCANNER_API_KEY &&
    process.env.SKYSCANNER_API_KEY !== "REMPLACEZ_PAR_VOTRE_CLE_SKYSCANNER";

  log("📊 État des APIs:", "bold");
  log(
    `   Amadeus (obligatoire):  ${
      amadeusOk ? "✅ CONFIGURÉE" : "❌ NON CONFIGURÉE"
    }`,
    amadeusOk ? "green" : "red"
  );
  log(
    `   OpenAI (recommandé):    ${
      openaiOk ? "✅ CONFIGURÉE" : "⚠️  NON CONFIGURÉE"
    }`,
    openaiOk ? "green" : "yellow"
  );
  log(
    `   Skyscanner (optionnel): ${
      skyscannerOk ? "✅ CONFIGURÉE" : "⚠️  NON CONFIGURÉE"
    }`,
    skyscannerOk ? "green" : "yellow"
  );

  console.log("");

  if (amadeusOk && openaiOk && skyscannerOk) {
    log("🎉 CONFIGURATION COMPLÈTE !", "green");
    log("   Toutes les APIs sont configurées", "green");
    log("   Vous bénéficiez de toutes les fonctionnalités", "green");
  } else if (amadeusOk && openaiOk) {
    log("✅ CONFIGURATION EXCELLENTE", "green");
    log("   Amadeus + OpenAI configurés", "green");
    log("   Fonctionnalités: Vols réels + Prédictions IA", "green");
  } else if (amadeusOk) {
    log("✅ CONFIGURATION MINIMALE VIABLE", "green");
    log("   Amadeus configuré (essentiel)", "green");
    log(
      "   Fonctionnalités: Vols réels + Scoring IA + Prédictions statistiques",
      "green"
    );
    log(
      "   💡 Conseil: Ajouter OpenAI pour des prédictions ML avancées",
      "yellow"
    );
  } else {
    log("⚠️  CONFIGURATION INCOMPLÈTE", "yellow");
    log("   Mode MOCK DATA actif", "yellow");
    log("   📖 Consulter: CONFIGURATION_API_KEYS.md", "blue");
  }

  console.log("");
  log("📝 Prochaines étapes:", "bold");
  if (!amadeusOk) {
    log("   1. Configurer Amadeus API (PRIORITÉ)", "yellow");
  }
  if (!openaiOk) {
    log(
      `   ${!amadeusOk ? "2" : "1"}. Configurer OpenAI API (recommandé)`,
      "blue"
    );
  }
  log(
    `   ${
      !amadeusOk && !openaiOk ? "3" : !amadeusOk || !openaiOk ? "2" : "1"
    }. Redémarrer le serveur`,
    "blue"
  );
  log(
    `   ${
      !amadeusOk && !openaiOk ? "4" : !amadeusOk || !openaiOk ? "3" : "2"
    }. Tester avec: node test-ai-flight-search.js`,
    "blue"
  );
}

async function runChecks() {
  log("\n" + "█".repeat(80), "blue");
  log(
    "█                                                                              █",
    "blue"
  );
  log(
    "█        🔍 VÉRIFICATION DE LA CONFIGURATION DES API KEYS - SMART TRIP      █",
    "blue"
  );
  log(
    "█                                                                              █",
    "blue"
  );
  log("█".repeat(80), "blue");

  console.log("");

  // Vérifier que le fichier .env existe
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    log("❌ ERREUR: Fichier .env introuvable !", "red");
    log("\n💡 Solution:", "yellow");
    log("   1. Copier .env.example vers .env", "yellow");
    log("   2. Modifier .env avec vos API keys", "yellow");
    process.exit(1);
  }

  log("✅ Fichier .env trouvé\n", "green");

  // Exécuter les tests
  const amadeusOk = await checkAmadeusConfig();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const openaiOk = await checkOpenAIConfig();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const skyscannerOk = await checkSkyscannerConfig();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await checkOverallStatus();

  console.log("\n");
}

// Exécution
if (require.main === module) {
  runChecks().catch((error) => {
    log(`\n💥 ERREUR: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runChecks };
