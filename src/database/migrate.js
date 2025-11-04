require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./connection');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('🔄 Démarrage des migrations de base de données...');

    // Lire le fichier SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Exécuter le schéma
    await db.query(schema);

    logger.info('✅ Migrations terminées avec succès !');
    logger.info('📊 Toutes les tables ont été créées');

    // Afficher la liste des tables
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    logger.info('📋 Tables créées :');
    result.rows.forEach(row => {
      logger.info(`   - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors des migrations:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
