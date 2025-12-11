-- Migration: Historique de recherche des utilisateurs
-- Date: 2025-12-11

-- Table de l'historique de recherche
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Critères de recherche
    origin_code VARCHAR(3) NOT NULL,
    origin_city VARCHAR(100),
    destination_code VARCHAR(3) NOT NULL,
    destination_city VARCHAR(100),
    departure_date DATE NOT NULL,
    return_date DATE,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    travel_class VARCHAR(20),
    
    -- Métadonnées
    search_type VARCHAR(20) DEFAULT 'one-way', -- 'one-way' ou 'round-trip'
    results_count INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamps
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index composite pour éviter trop d'entrées identiques
    UNIQUE(user_id, origin_code, destination_code, departure_date, searched_at)
);

-- Index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON user_search_history(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_routes ON user_search_history(origin_code, destination_code);
CREATE INDEX IF NOT EXISTS idx_search_history_departure_date ON user_search_history(departure_date);

-- Vue pour les tendances globales (pour l'admin)
CREATE OR REPLACE VIEW search_trends AS
SELECT 
    origin_code,
    origin_city,
    destination_code,
    destination_city,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(adults) as avg_adults,
    DATE_TRUNC('day', searched_at) as search_date
FROM user_search_history
WHERE searched_at >= NOW() - INTERVAL '30 days'
GROUP BY origin_code, origin_city, destination_code, destination_city, DATE_TRUNC('day', searched_at)
ORDER BY search_count DESC;

-- Vue pour les destinations les plus recherchées
CREATE OR REPLACE VIEW popular_destinations AS
SELECT 
    destination_code,
    destination_city,
    COUNT(*) as search_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(searched_at) as last_searched
FROM user_search_history
WHERE searched_at >= NOW() - INTERVAL '7 days'
GROUP BY destination_code, destination_city
ORDER BY search_count DESC
LIMIT 50;
