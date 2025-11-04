const db = require('./connection');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    logger.info('🌱 Démarrage du seed de la base de données...');

    // Utilisateurs de test
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    const users = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, email_verified)
      VALUES 
        ('test@smarttrip.com', $1, 'Jean', 'Dupont', true),
        ('marie@smarttrip.com', $1, 'Marie', 'Martin', true),
        ('paul@smarttrip.com', $1, 'Paul', 'Dubois', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `, [hashedPassword]);

    logger.info(`✅ ${users.rows.length} utilisateurs créés`);

    // Profils utilisateurs
    if (users.rows.length > 0) {
      for (const user of users.rows) {
        await db.query(`
          INSERT INTO user_profiles (user_id, budget_range, preferred_class, travel_style, max_stops)
          VALUES ($1, 'medium', 'economy', 'adventure', 1)
          ON CONFLICT (user_id) DO NOTHING;
        `, [user.id]);
      }
      logger.info('✅ Profils utilisateurs créés');
    }

    // Destinations tendances
    const destinations = [
      ['Paris', 'FR', 'France', 'Ville lumière et capitale de la romance', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', 450],
      ['Tokyo', 'JP', 'Japon', 'Mélange unique de tradition et modernité', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', 800],
      ['New York', 'US', 'États-Unis', 'La ville qui ne dort jamais', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', 650],
      ['Bali', 'ID', 'Indonésie', 'Paradis tropical et spirituel', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 550],
      ['Lisbonne', 'PT', 'Portugal', 'Charme authentique et architecture colorée', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b', 300],
      ['Dubaï', 'AE', 'Émirats Arabes Unis', 'Luxe et modernité dans le désert', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 500]
    ];

    for (const [city, code, country, desc, img, price] of destinations) {
      await db.query(`
        INSERT INTO trending_destinations (city, country_code, country_name, description, image_url, average_price, search_count, trend_score, week_start)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
        ON CONFLICT DO NOTHING;
      `, [city, code, country, desc, img, price, Math.floor(Math.random() * 1000), (Math.random() * 100).toFixed(2)]);
    }

    logger.info('✅ Destinations tendances créées');

    // Activités à Paris
    const activities = [
      ['Tour Eiffel', 'Paris', 'FR', 'Monument emblématique de Paris', 'cultural', 48.8584, 2.2945, 120, 'medium', 4.7],
      ['Musée du Louvre', 'Paris', 'FR', 'Le plus grand musée d\'art au monde', 'museum', 48.8606, 2.3376, 180, 'medium', 4.8],
      ['Arc de Triomphe', 'Paris', 'FR', 'Monument historique sur les Champs-Élysées', 'cultural', 48.8738, 2.2950, 60, 'low', 4.6]
    ];

    for (const [name, city, code, desc, cat, lat, lng, dur, price, rating] of activities) {
      await db.query(`
        INSERT INTO activities (name, city, country_code, description, category, latitude, longitude, average_duration_minutes, price_range, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING;
      `, [name, city, code, desc, cat, lat, lng, dur, price, rating]);
    }

    logger.info('✅ Activités créées');

    logger.info('🎉 Seed terminé avec succès !');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erreur lors du seed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
