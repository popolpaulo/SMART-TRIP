-- Migration: Ajouter la table des favoris (coups de cœur)
-- Date: 2025-11-27

-- Table des vols favoris
CREATE TABLE IF NOT EXISTS user_favorite_flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Détails du vol sauvegardé
    airline_code VARCHAR(3),
    airline_name VARCHAR(100),
    flight_number VARCHAR(10),
    origin_code VARCHAR(3) NOT NULL,
    origin_city VARCHAR(100),
    destination_code VARCHAR(3) NOT NULL,
    destination_city VARCHAR(100),
    departure_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    stops INTEGER DEFAULT 0,
    cabin_class VARCHAR(20),
    
    -- Prix et détails
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Informations supplémentaires
    baggage_allowance JSONB,
    is_refundable BOOLEAN DEFAULT FALSE,
    carbon_footprint_kg DECIMAL(10, 2),
    
    -- Notes personnelles
    user_notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour éviter les doublons
    UNIQUE(user_id, airline_code, flight_number, departure_datetime)
);

-- Index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_favorite_flights_user_id ON user_favorite_flights(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_flights_departure ON user_favorite_flights(departure_datetime);
CREATE INDEX IF NOT EXISTS idx_favorite_flights_created_at ON user_favorite_flights(created_at DESC);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_favorite_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique
CREATE TRIGGER update_favorite_flights_timestamp
    BEFORE UPDATE ON user_favorite_flights
    FOR EACH ROW
    EXECUTE FUNCTION update_favorite_timestamp();

COMMENT ON TABLE user_favorite_flights IS 'Table des vols favoris (coups de cœur) des utilisateurs';
