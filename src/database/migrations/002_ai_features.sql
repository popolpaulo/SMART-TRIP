-- Migration 002: AI Features for Intelligent Flight Comparison
-- Tables pour profils utilisateurs IA, historique de prix et prédictions

-- =========================================
-- Table: user_profiles (Profils utilisateurs pour l'IA)
-- =========================================
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Préférences de voyage
    budget_preference VARCHAR(20) DEFAULT 'moderate' CHECK (budget_preference IN ('economy', 'moderate', 'premium', 'luxury')),
    comfort_preference VARCHAR(20) DEFAULT 'standard' CHECK (comfort_preference IN ('basic', 'standard', 'premium', 'luxury')),
    max_layovers INT DEFAULT 1,
    preferred_airlines TEXT[], -- Array de codes IATA (ex: ['AF', 'BA', 'LH'])
    avoided_airlines TEXT[],
    preferred_airports TEXT[], -- Aéroports de départ préférés
    
    -- Préférences de siège et service
    seat_preference VARCHAR(20) CHECK (seat_preference IN ('window', 'aisle', 'no_preference')),
    meal_preference VARCHAR(30),
    loyalty_programs JSONB DEFAULT '[]'::jsonb, -- [{airline: 'AF', number: '12345'}]
    
    -- Paramètres IA
    ai_recommendations_enabled BOOLEAN DEFAULT true,
    price_alerts_enabled BOOLEAN DEFAULT true,
    optimal_booking_time_alerts BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_preferences ON user_profiles(budget_preference, comfort_preference);

-- =========================================
-- Table: price_history (Historique des prix pour ML)
-- =========================================
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    
    -- Route identifiers
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    route_hash VARCHAR(64) NOT NULL, -- Hash pour déduplication (origin+dest+class)
    
    -- Prix et détails
    cabin_class VARCHAR(20) DEFAULT 'economy',
    avg_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    num_flights_sampled INT DEFAULT 0,
    
    -- Temporal data
    date DATE NOT NULL,
    day_of_week INT, -- 0=Sunday, 6=Saturday
    is_weekend BOOLEAN,
    is_holiday BOOLEAN DEFAULT false,
    days_before_departure INT, -- Combien de jours avant le départ
    
    -- Source tracking
    data_source VARCHAR(50), -- 'amadeus', 'skyscanner', 'aggregated'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_route ON price_history(origin_code, destination_code, cabin_class);
CREATE INDEX idx_price_history_date ON price_history(date);
CREATE INDEX idx_price_history_hash ON price_history(route_hash, date);

-- =========================================
-- Table: ai_predictions (Prédictions de prix par l'IA)
-- =========================================
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    
    -- Reference to search (UUID foreign key)
    search_id UUID REFERENCES flight_searches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Route details
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    cabin_class VARCHAR(20) DEFAULT 'economy',
    
    -- Prediction data
    current_price DECIMAL(10,2) NOT NULL,
    predicted_prices JSONB NOT NULL, -- {"+7days": 450, "+14days": 420, "+30days": 480}
    price_trend VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
    confidence_level VARCHAR(20), -- 'high', 'medium', 'low'
    
    -- Recommendation
    recommendation VARCHAR(50), -- 'book_now', 'wait_1week', 'wait_2weeks', 'monitor'
    recommendation_reason TEXT,
    optimal_booking_date DATE,
    estimated_savings DECIMAL(10,2),
    
    -- Model info
    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    prediction_method VARCHAR(50), -- 'openai', 'statistical', 'hybrid'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- Expiration de la prédiction (7 jours)
);

CREATE INDEX idx_ai_predictions_search ON ai_predictions(search_id);
CREATE INDEX idx_ai_predictions_user ON ai_predictions(user_id);
CREATE INDEX idx_ai_predictions_route ON ai_predictions(origin_code, destination_code, departure_date);

-- =========================================
-- Table: vpn_price_comparisons (Comparaisons de prix multi-pays)
-- =========================================
CREATE TABLE IF NOT EXISTS vpn_price_comparisons (
    id SERIAL PRIMARY KEY,
    
    -- Reference (UUID foreign keys)
    search_id UUID REFERENCES flight_searches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Route details
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    
    -- Country comparison data
    countries_checked TEXT[] NOT NULL, -- ['FR', 'US', 'GB', 'DE']
    price_comparison JSONB NOT NULL, -- {FR: {currency: 'EUR', prices: [450, 520]}, US: {...}}
    
    -- Best deal
    best_country VARCHAR(2),
    best_price DECIMAL(10,2),
    best_currency VARCHAR(3),
    potential_savings DECIMAL(10,2),
    savings_percentage DECIMAL(5,2),
    
    -- VPN service used
    vpn_service VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vpn_comparisons_search ON vpn_price_comparisons(search_id);
CREATE INDEX idx_vpn_comparisons_user ON vpn_price_comparisons(user_id);

-- =========================================
-- Table: flight_results (Cache des résultats de recherche)
-- =========================================
-- Note: This table already exists from schema.sql, indexes already created
-- We just ensure they exist here for completeness

-- CREATE INDEX IF NOT EXISTS idx_flight_results_expires ON flight_results(expires_at);
-- CREATE INDEX IF NOT EXISTS idx_flight_results_price ON flight_results(price_amount);

-- =========================================
-- Triggers pour updated_at
-- =========================================
-- Note: La fonction update_updated_at_column() existe déjà dans schema.sql
-- On ne la recrée pas ici

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- Fonctions utilitaires
-- =========================================

-- Fonction pour calculer le hash de route (utilisé pour déduplication)
CREATE OR REPLACE FUNCTION calculate_route_hash(
    p_origin VARCHAR(3),
    p_destination VARCHAR(3),
    p_class VARCHAR(20)
) RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(digest(
        CONCAT(UPPER(p_origin), '-', UPPER(p_destination), '-', LOWER(p_class)),
        'sha256'
    ), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour nettoyer les anciennes prédictions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_predictions()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_predictions WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM flight_results WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- Vues utiles pour analytics
-- =========================================

-- Vue: Prix moyens par route et période
CREATE OR REPLACE VIEW v_route_price_trends AS
SELECT 
    origin_code,
    destination_code,
    cabin_class,
    DATE_TRUNC('week', date) as week,
    AVG(avg_price) as weekly_avg_price,
    MIN(min_price) as weekly_min_price,
    MAX(max_price) as weekly_max_price,
    COUNT(*) as num_samples
FROM price_history
GROUP BY origin_code, destination_code, cabin_class, DATE_TRUNC('week', date)
ORDER BY week DESC;

-- Vue: Performance des prédictions IA
CREATE OR REPLACE VIEW v_ai_prediction_accuracy AS
SELECT 
    ai_model,
    prediction_method,
    confidence_level,
    recommendation,
    COUNT(*) as total_predictions,
    AVG(estimated_savings) as avg_estimated_savings,
    DATE_TRUNC('day', created_at) as prediction_date
FROM ai_predictions
GROUP BY ai_model, prediction_method, confidence_level, recommendation, DATE_TRUNC('day', created_at)
ORDER BY prediction_date DESC;

-- =========================================
-- Données initiales
-- =========================================

-- Créer des profils par défaut pour les utilisateurs existants
INSERT INTO user_profiles (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- =========================================
-- Comments pour documentation
-- =========================================
COMMENT ON TABLE user_profiles IS 'Profils utilisateurs pour personnalisation IA des recommandations de vols';
COMMENT ON TABLE price_history IS 'Historique des prix pour entraînement ML et prédictions';
COMMENT ON TABLE ai_predictions IS 'Prédictions de prix générées par OpenAI GPT-4';
COMMENT ON TABLE vpn_price_comparisons IS 'Comparaisons de prix multi-pays via VPN';

COMMENT ON COLUMN user_profiles.budget_preference IS 'Niveau de budget: economy, moderate, premium, luxury';
COMMENT ON COLUMN user_profiles.comfort_preference IS 'Niveau de confort souhaité: basic, standard, premium, luxury';
COMMENT ON COLUMN user_profiles.loyalty_programs IS 'JSON array des programmes de fidélité: [{airline: code, number: string}]';

COMMENT ON COLUMN price_history.route_hash IS 'SHA-256 hash de origin+destination+class pour déduplication';
COMMENT ON COLUMN price_history.days_before_departure IS 'Jours avant départ lors de la capture du prix (pour analyse booking window)';

COMMENT ON COLUMN ai_predictions.predicted_prices IS 'JSON avec prédictions: {"+7days": price, "+14days": price, "+30days": price}';
COMMENT ON COLUMN ai_predictions.recommendation IS 'Recommandation: book_now, wait_1week, wait_2weeks, monitor';

COMMENT ON FUNCTION calculate_route_hash IS 'Génère un hash unique pour une route (origin+destination+class)';
COMMENT ON FUNCTION cleanup_expired_predictions IS 'Nettoie les prédictions et résultats expirés (à exécuter périodiquement)';
