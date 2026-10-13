-- FarmerOS Migration 0002: private farmer profiles.
-- Run this file manually in the Supabase SQL Editor. It is intentionally not run by the app.

-- 1. Roles are controlled by the database, not by profile forms.
CREATE TYPE public.app_role AS ENUM ('farmer', 'expert', 'worker', 'seller', 'admin');

-- 2. Each auth user gets one private profile row.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'mr', 'hi')),
  village TEXT,
  taluka TEXT,
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  farmer_type TEXT CHECK (farmer_type IS NULL OR farmer_type IN ('small', 'marginal', 'medium', 'large', 'tenant')),
  years_farming INTEGER CHECK (years_farming IS NULL OR years_farming >= 0),
  primary_crops TEXT[],
  voice_first BOOLEAN NOT NULL DEFAULT FALSE,
  low_literacy_mode BOOLEAN NOT NULL DEFAULT FALSE,
  role public.app_role NOT NULL DEFAULT 'farmer',
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Keep the updated timestamp current for every profile edit.
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Create the profile automatically after Supabase Auth creates a user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. A profile is private: only its owner can read or edit it.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Never allow a farmer to promote themselves or change their role.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Profile role changes are managed by administrators';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

COMMENT ON TABLE public.profiles IS 'Private farmer profile information linked to one Supabase Auth user.';
COMMENT ON COLUMN public.profiles.phone IS 'Optional phone number; storing it does not verify it.';
COMMENT ON COLUMN public.profiles.role IS 'Controlled application role; users cannot change this value.';
