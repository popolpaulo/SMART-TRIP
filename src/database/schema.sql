-- SMART TRIP - Schéma de base de données PostgreSQL
-- Version 1.0

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(2), -- Code pays ISO
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des profils utilisateurs (préférences de voyage)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    budget_range VARCHAR(20), -- low, medium, high, luxury
    preferred_class VARCHAR(20), -- economy, premium_economy, business, first
    preferred_airlines TEXT[], -- Array de codes IATA
    comfort_level VARCHAR(20), -- basic, standard, premium
    travel_style VARCHAR(20), -- adventure, relax, romantic, cultural
    max_stops INTEGER DEFAULT 1,
    seat_preference VARCHAR(20), -- window, aisle, any
    meal_preference VARCHAR(50), -- vegetarian, vegan, halal, kosher, etc.
    accessibility_needs TEXT,
    newsletter_subscribed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des recherches de vols
CREATE TABLE IF NOT EXISTS flight_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    origin_code VARCHAR(3) NOT NULL, -- Code IATA
    destination_code VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    passengers_adults INTEGER DEFAULT 1,
    passengers_children INTEGER DEFAULT 0,
    passengers_infants INTEGER DEFAULT 0,
    cabin_class VARCHAR(20),
    is_flexible BOOLEAN DEFAULT FALSE,
    vpn_location VARCHAR(2), -- Code pays pour VPN
    search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des résultats de vols (cache)
CREATE TABLE IF NOT EXISTS flight_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID REFERENCES flight_searches(id) ON DELETE CASCADE,
    airline_code VARCHAR(3),
    airline_name VARCHAR(100),
    flight_number VARCHAR(10),
    origin_code VARCHAR(3) NOT NULL,
    destination_code VARCHAR(3) NOT NULL,
    departure_datetime TIMESTAMP NOT NULL,
    arrival_datetime TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    stops INTEGER DEFAULT 0,
    cabin_class VARCHAR(20),
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'EUR',
    price_country VARCHAR(2), -- Pays où le prix a été trouvé
    available_seats INTEGER,
    carbon_footprint_kg DECIMAL(10, 2),
    is_refundable BOOLEAN DEFAULT FALSE,
    baggage_allowance JSONB, -- {carry_on: "1x8kg", checked: "1x23kg"}
    raw_data JSONB, -- Données complètes de l'API
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des hôtels
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    stars INTEGER CHECK (stars >= 0 AND stars <= 5),
    rating DECIMAL(3, 2), -- Note sur 5
    amenities TEXT[], -- wifi, pool, gym, parking, etc.
    description TEXT,
    images_urls TEXT[],
    external_id VARCHAR(100), -- ID de l'API externe
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prix d'hôtels
CREATE TABLE IF NOT EXISTS hotel_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    country_searched VARCHAR(2), -- Pays VPN
    available_rooms INTEGER,
    cancellation_policy TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des voyages planifiés
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination_city VARCHAR(100),
    destination_country VARCHAR(2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_total DECIMAL(10, 2),
    budget_spent DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'planned', -- planned, booked, ongoing, completed, cancelled
    trip_style VARCHAR(20), -- adventure, relax, romantic, cultural
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations de vols
CREATE TABLE IF NOT EXISTS flight_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flight_result_id UUID REFERENCES flight_results(id) ON DELETE SET NULL,
    booking_reference VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    passengers JSONB, -- Détails des passagers
    payment_status VARCHAR(20) DEFAULT 'pending',
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations d'hôtels
CREATE TABLE IF NOT EXISTS hotel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
    booking_reference VARCHAR(50) UNIQUE,
    room_type VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_status VARCHAR(20) DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des alertes de prix
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL, -- flight, hotel, destination
    origin_code VARCHAR(3),
    destination_code VARCHAR(3),
    departure_date_start DATE,
    departure_date_end DATE,
    target_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT TRUE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des activités/points d'intérêt
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    category VARCHAR(50), -- museum, restaurant, adventure, cultural, nature
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    average_duration_minutes INTEGER,
    price_range VARCHAR(20), -- free, low, medium, high
    rating DECIMAL(3, 2),
    images_urls TEXT[],
    opening_hours JSONB,
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison trip-activités
CREATE TABLE IF NOT EXISTS trip_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    scheduled_date DATE,
    scheduled_time TIME,
    status VARCHAR(20) DEFAULT 'planned', -- planned, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, activity_id)
);

-- Table des destinations tendances
CREATE TABLE IF NOT EXISTS trending_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    country_name VARCHAR(100),
    search_count INTEGER DEFAULT 0,
    trend_score DECIMAL(5, 2), -- Score de tendance calculé
    average_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    season VARCHAR(20), -- summer, winter, spring, fall, all_year
    description TEXT,
    image_url VARCHAR(500),
    week_start DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'IA (pour analyse des préférences)
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50), -- search, recommendation, price_prediction
    input_data JSONB,
    output_data JSONB,
    model_version VARCHAR(50),
    confidence_score DECIMAL(3, 2),
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_flight_searches_user ON flight_searches(user_id);
CREATE INDEX idx_flight_searches_dates ON flight_searches(departure_date, return_date);
CREATE INDEX idx_flight_results_search ON flight_results(search_id);
CREATE INDEX idx_flight_results_price ON flight_results(price_amount);
CREATE INDEX idx_hotels_location ON hotels(city, country_code);
CREATE INDEX idx_hotel_prices_dates ON hotel_prices(check_in_date, check_out_date);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);
CREATE INDEX idx_activities_location ON activities(city, country_code);
CREATE INDEX idx_trending_week ON trending_destinations(week_start);

-- Trigger pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_bookings_updated_at BEFORE UPDATE ON flight_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON hotel_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trending_destinations_updated_at BEFORE UPDATE ON trending_destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
