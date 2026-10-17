-- FarmerOS Migration 0005: Government farmer registry and farm land record fields.
-- Run this file manually in the Supabase SQL Editor.

-- 1. Add government & comprehensive farming fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS farmer_id TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_last_four TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS social_category TEXT CHECK (social_category IS NULL OR social_category IN ('general', 'obc', 'sc', 'st')),
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS pm_kisan_id TEXT,
  ADD COLUMN IF NOT EXISTS kcc_holder BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS kcc_limit NUMERIC,
  ADD COLUMN IF NOT EXISTS pmfby_policy_number TEXT,
  ADD COLUMN IF NOT EXISTS ration_card_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number_last_four TEXT,
  ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
  ADD COLUMN IF NOT EXISTS dbt_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS farming_type TEXT CHECK (farming_type IS NULL OR farming_type IN ('rainfed', 'irrigated', 'organic', 'natural', 'conventional')),
  ADD COLUMN IF NOT EXISTS total_land_acres NUMERIC,
  ADD COLUMN IF NOT EXISTS primary_irrigation_source TEXT,
  ADD COLUMN IF NOT EXISTS machinery_owned TEXT[],
  ADD COLUMN IF NOT EXISTS livestock_owned TEXT[],
  ADD COLUMN IF NOT EXISTS storage_facility TEXT CHECK (storage_facility IS NULL OR storage_facility IN ('on_farm', 'warehouse', 'cold_storage', 'none')),
  ADD COLUMN IF NOT EXISTS soil_health_card_number TEXT;

-- 2. Add government land record & agricultural infrastructure fields to farms
ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS sub_division_number TEXT,
  ADD COLUMN IF NOT EXISTS khata_number TEXT,
  ADD COLUMN IF NOT EXISTS land_classification TEXT CHECK (land_classification IS NULL OR land_classification IN ('jirayat', 'bagayat', 'tari', 'padh')),
  ADD COLUMN IF NOT EXISTS area_gunthas NUMERIC,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS irrigation_source TEXT CHECK (irrigation_source IS NULL OR irrigation_source IN ('borewell', 'well', 'canal', 'farm_pond', 'river', 'rainfed', 'other')),
  ADD COLUMN IF NOT EXISTS pump_type TEXT CHECK (pump_type IS NULL OR pump_type IN ('grid_electric', 'solar_kusum', 'diesel', 'none'));

COMMENT ON COLUMN public.profiles.farmer_id IS 'Unique Farmer ID from Central/State AgriStack Farmer Registry';
COMMENT ON COLUMN public.profiles.aadhaar_last_four IS 'Last 4 digits of Aadhaar for identity verification without storing full UID';
COMMENT ON COLUMN public.profiles.pm_kisan_id IS 'PM-KISAN registration or beneficiary reference number';
COMMENT ON COLUMN public.profiles.dbt_enabled IS 'Whether bank account is seeded with Aadhaar for Direct Benefit Transfer';
COMMENT ON COLUMN public.farms.sub_division_number IS 'Sub-division / Hissa number as per official 7/12 land records';
COMMENT ON COLUMN public.farms.khata_number IS '8-A Khata number as per official revenue land records';
