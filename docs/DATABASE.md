# FarmerOS Database

## `public.profiles`

The `profiles` table stores the farmer profile connected to a Supabase Auth user. A profile is created automatically when a new user signs up.

It stores the farmer's name, optional phone number, preferred language, location, farmer type, farming experience, primary crops, accessibility preferences, and profile completion status. The `role` is controlled by the application and is not editable by the farmer.

## Security rules

- Row Level Security is enabled.
- A signed-in user can read only the profile whose `id` matches their own Auth user ID.
- A signed-in user can update only their own profile.
- There is no public read policy.
- A database trigger rejects any attempt to change a profile role.
- Profile creation is performed by the protected signup trigger, not by a public insert policy.

Run `supabase/migrations/0002_profiles.sql` manually in the Supabase SQL Editor before testing signup or profile editing.

## Farms, plots, and boundary surveys

Migration `0003_farms_plots_surveys.sql` adds private `farms`, `plots`, and
`boundary_surveys` tables. A farm can have many plots. A survey may describe a
whole farm (`plot_id` is null) or one plot.

All three tables have RLS. A signed-in farmer can only read, add, or update
their own farm and plot rows. Survey rows can be read or added by their owner,
but never updated or deleted. Survey history is append-only: re-measuring
creates a new version. The database trigger copies owners from the farm and
plot, assigns the next version, validates the polygon, and computes
`area_sqm` and `perimeter_m` using PostGIS geography functions. Client values
for those measurements are ignored.

Spatial columns have GIST indexes and owner/farm/plot columns have btree
indexes. `farm_summary` is a RLS-aware view with the latest whole-farm area,
version, and active plot count.

Run `supabase/migrations/0003_farms_plots_surveys.sql` manually in the
Supabase SQL Editor once after the profile migration. It is safe to run again.

## Places search

Migration `0004_places_search.sql` enables `pg_trgm` and `unaccent`, creates
the public `places` table, and adds a `places_import` staging table.
Authenticated users can read `places`, but browser clients cannot change either
table. The importer stores GeoNames identifiers and licence information.

The `place_name_key` function makes a spelling-tolerant key for Indian place
names. `search_places` accepts the typed text and an optional nearby farm or
boundary point. It returns up to 15 ranked places, including district and
taluka fallback places. The migration is safe to run again. Import instructions
are in [`PLACES_IMPORT.md`](./PLACES_IMPORT.md).
