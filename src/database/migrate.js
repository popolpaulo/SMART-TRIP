require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("./connection");
const logger = require("../utils/logger");

async function runMigrations() {
  try {
    logger.info("🔄 Démarrage des migrations de base de données...");

    // Migration 001: Schema principal (skip si déjà exécutée)
    logger.info("📝 Migration 001: Schema principal...");
    try {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      await db.query(schema);
      logger.info("✅ Migration 001 terminée");
    } catch (error) {
      if (error.message.includes("already exists")) {
        logger.info("⏭️  Migration 001 déjà appliquée, passage ignoré");
      } else {
        throw error;
      }
    }

    // Migration 002: AI Features
    logger.info(
      "📝 Migration 002: AI Features (profils utilisateurs, prédictions, VPN)..."
    );
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "002_ai_features.sql"
    );
    if (fs.existsSync(migrationPath)) {
      try {
        const migration = fs.readFileSync(migrationPath, "utf8");
        await db.query(migration);
        logger.info("✅ Migration 002 terminée");
      } catch (error) {
        if (error.message.includes("already exists")) {
          logger.info("⏭️  Migration 002 déjà appliquée, passage ignoré");
        } else {
          throw error;
        }
      }
    } else {
      logger.warn("⚠️ Migration 002 introuvable, passage ignoré");
    }

    logger.info("✅ Toutes les migrations terminées avec succès !");
    logger.info("📊 Base de données à jour");

    // Afficher la liste des tables
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    logger.info("📋 Tables créées :");
    result.rows.forEach((row) => {
      logger.info(`   - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error("❌ Erreur lors des migrations:", error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
