-- Migration pour ajouter les prix réels aux destinations tendances
-- Ajoute min_price et last_price_update pour tracker les mises à jour

ALTER TABLE trending_destinations 
ADD COLUMN IF NOT EXISTS min_price INTEGER,
ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMP;

-- Commentaires pour documentation
COMMENT ON COLUMN trending_destinations.average_price IS 'Prix moyen réel récupéré depuis les APIs de vols';
COMMENT ON COLUMN trending_destinations.min_price IS 'Prix minimum trouvé parmi les vols disponibles';
COMMENT ON COLUMN trending_destinations.last_price_update IS 'Dernière mise à jour des prix depuis les APIs';

-- Index pour optimiser les requêtes sur last_price_update
CREATE INDEX IF NOT EXISTS idx_trending_destinations_last_update 
ON trending_destinations(last_price_update DESC);
