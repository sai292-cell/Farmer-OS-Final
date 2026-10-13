-- FarmerOS migration 0003: farms, plots, and append-only boundary measurements.
-- Run this file manually in the Supabase SQL Editor after 0001 and 0002.

CREATE TABLE IF NOT EXISTS public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  land_type text NOT NULL DEFAULT 'owned' CHECK (land_type IN ('owned', 'leased', 'rented', 'shared')),
  survey_number text,
  village text,
  taluka text,
  district text,
  state text,
  notes text,
  location geography(Point, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.boundary_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  plot_id uuid REFERENCES public.plots(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  polygon geography(Polygon, 4326) NOT NULL,
  raw_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  method text NOT NULL CHECK (method IN ('drawn_on_map', 'walked_gps')),
  area_sqm numeric NOT NULL DEFAULT 0,
  perimeter_m numeric NOT NULL DEFAULT 0,
  sides jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS farms_owner_id_idx ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS farms_location_gist_idx ON public.farms USING gist(location);
CREATE INDEX IF NOT EXISTS plots_owner_id_idx ON public.plots(owner_id);
CREATE INDEX IF NOT EXISTS plots_farm_id_idx ON public.plots(farm_id);
CREATE INDEX IF NOT EXISTS boundary_surveys_owner_id_idx ON public.boundary_surveys(owner_id);
CREATE INDEX IF NOT EXISTS boundary_surveys_farm_id_idx ON public.boundary_surveys(farm_id);
CREATE INDEX IF NOT EXISTS boundary_surveys_plot_id_idx ON public.boundary_surveys(plot_id);
CREATE INDEX IF NOT EXISTS boundary_surveys_polygon_gist_idx ON public.boundary_surveys USING gist(polygon);

CREATE OR REPLACE FUNCTION public.set_plot_owner_from_farm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  SELECT owner_id INTO NEW.owner_id FROM public.farms WHERE id = NEW.farm_id;
  IF NEW.owner_id IS NULL THEN
    RAISE EXCEPTION 'The plot must belong to an existing farm';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_survey_owner_and_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  farm_owner uuid;
  plot_farm uuid;
  next_version integer;
BEGIN
  SELECT owner_id INTO farm_owner FROM public.farms WHERE id = NEW.farm_id;
  IF farm_owner IS NULL THEN
    RAISE EXCEPTION 'The boundary survey must belong to an existing farm';
  END IF;
  IF NEW.plot_id IS NOT NULL THEN
    SELECT farm_id INTO plot_farm FROM public.plots WHERE id = NEW.plot_id AND owner_id = farm_owner;
    IF plot_farm IS NULL OR plot_farm <> NEW.farm_id THEN
      RAISE EXCEPTION 'The selected plot does not belong to this farm';
    END IF;
  END IF;
  NEW.owner_id := farm_owner;
  PERFORM pg_advisory_xact_lock(hashtext(NEW.farm_id::text || ':' || coalesce(NEW.plot_id::text, 'farm')));
  SELECT coalesce(max(version_number), 0) + 1 INTO next_version
  FROM public.boundary_surveys
  WHERE farm_id = NEW.farm_id AND plot_id IS NOT DISTINCT FROM NEW.plot_id;
  NEW.version_number := next_version;
  IF NOT ST_IsValid(NEW.polygon::geometry) OR ST_NPoints(ST_ExteriorRing(NEW.polygon::geometry)) < 4
     OR ST_NPoints(ST_ExteriorRing(NEW.polygon::geometry)) - 1 < 3 THEN
    RAISE EXCEPTION 'Boundary polygon is invalid. Record at least three distinct points and close the shape.';
  END IF;
  NEW.area_sqm := ST_Area(NEW.polygon);
  NEW.perimeter_m := ST_Perimeter(NEW.polygon);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_owner_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'The record owner cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_boundary_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Account deletion cascades are performed by the database owner.
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Boundary history is append-only; create a new survey version instead';
END;
$$;

DROP TRIGGER IF EXISTS plots_set_owner ON public.plots;
CREATE TRIGGER plots_set_owner BEFORE INSERT OR UPDATE OF farm_id ON public.plots
FOR EACH ROW EXECUTE FUNCTION public.set_plot_owner_from_farm();
DROP TRIGGER IF EXISTS farms_updated_at ON public.farms;
CREATE TRIGGER farms_updated_at BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS plots_updated_at ON public.plots;
CREATE TRIGGER plots_updated_at BEFORE UPDATE ON public.plots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS farms_owner_immutable ON public.farms;
CREATE TRIGGER farms_owner_immutable BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();
DROP TRIGGER IF EXISTS plots_owner_immutable ON public.plots;
CREATE TRIGGER plots_owner_immutable BEFORE UPDATE ON public.plots
FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();
DROP TRIGGER IF EXISTS surveys_prepare ON public.boundary_surveys;
CREATE TRIGGER surveys_prepare BEFORE INSERT ON public.boundary_surveys
FOR EACH ROW EXECUTE FUNCTION public.set_survey_owner_and_version();
DROP TRIGGER IF EXISTS surveys_append_only_update ON public.boundary_surveys;
CREATE TRIGGER surveys_append_only_update BEFORE UPDATE ON public.boundary_surveys
FOR EACH ROW EXECUTE FUNCTION public.prevent_boundary_mutation();
DROP TRIGGER IF EXISTS surveys_append_only_delete ON public.boundary_surveys;
CREATE TRIGGER surveys_append_only_delete BEFORE DELETE ON public.boundary_surveys
FOR EACH ROW EXECUTE FUNCTION public.prevent_boundary_mutation();

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boundary_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farms_select_own ON public.farms;
DROP POLICY IF EXISTS farms_insert_own ON public.farms;
DROP POLICY IF EXISTS farms_update_own ON public.farms;
CREATE POLICY farms_select_own ON public.farms FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY farms_insert_own ON public.farms FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY farms_update_own ON public.farms FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS plots_select_own ON public.plots;
DROP POLICY IF EXISTS plots_insert_own ON public.plots;
DROP POLICY IF EXISTS plots_update_own ON public.plots;
DROP POLICY IF EXISTS plots_delete_own ON public.plots;
CREATE POLICY plots_select_own ON public.plots FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY plots_insert_own ON public.plots FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY plots_update_own ON public.plots FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY plots_delete_own ON public.plots FOR DELETE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS surveys_select_own ON public.boundary_surveys;
DROP POLICY IF EXISTS surveys_insert_own ON public.boundary_surveys;
CREATE POLICY surveys_select_own ON public.boundary_surveys FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY surveys_insert_own ON public.boundary_surveys FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE VIEW public.farm_summary
WITH (security_invoker = true)
AS
SELECT f.id AS farm_id, f.owner_id, f.name,
  (SELECT bs.version_number FROM public.boundary_surveys bs
   WHERE bs.farm_id = f.id AND bs.plot_id IS NULL ORDER BY bs.version_number DESC LIMIT 1) AS latest_whole_farm_version,
  (SELECT bs.area_sqm FROM public.boundary_surveys bs
   WHERE bs.farm_id = f.id AND bs.plot_id IS NULL ORDER BY bs.version_number DESC LIMIT 1) AS latest_area_sqm,
  (SELECT count(*)::integer FROM public.plots p WHERE p.farm_id = f.id AND p.archived_at IS NULL) AS plot_count
FROM public.farms f
WHERE f.archived_at IS NULL;
