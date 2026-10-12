-- FarmerOS Migration 0001: Enable Core Extensions & Timestamp Helpers
-- Purpose: Enable PostGIS for geospatial farm boundaries, pgcrypto for UUIDs, and automated updated_at triggers.

-- 1. Enable PostGIS extension for spatial boundary polygons and GPS centroids
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Enable pgcrypto extension for cryptographic functions and UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Reusable trigger function to automatically maintain updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
