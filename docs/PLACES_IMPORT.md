# Import Maharashtra places

1. Download the GeoNames `IN` files into `data/geonames/main/IN.txt`,
   `data/geonames/alt/IN.txt`, and place `admin1CodesASCII.txt` and
   `admin2Codes.txt` in `data/geonames/`.
2. Run `npm run places:build`. The script reads Maharashtra's admin1 code from
   the file, validates coordinates, prints counts, and prints ten sample rows.
3. In Supabase SQL Editor, run
   `supabase/migrations/0004_places_search.sql`.
4. In Supabase Table Editor, open `places_import`, choose **Insert** and
   **Import data from CSV**, and upload `data/places_maharashtra.csv`.
   If `--split 20000` was used, import each generated CSV file.
5. Run this one-time copy statement:

```sql
INSERT INTO public.places
  (name, name_local, alt_names, place_type, district, state, population, location, source, source_id, source_licence)
SELECT name, name_local, alt_names, place_type, district, state, population,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  source, source_id, source_licence
FROM public.places_import
ON CONFLICT (source, source_id) DO UPDATE SET
  name = EXCLUDED.name, name_local = EXCLUDED.name_local,
  alt_names = EXCLUDED.alt_names, place_type = EXCLUDED.place_type,
  district = EXCLUDED.district, population = EXCLUDED.population,
  location = EXCLUDED.location, source_licence = EXCLUDED.source_licence;

TRUNCATE public.places_import;
```

6. Test the search:

```sql
SELECT * FROM public.search_places('Khedle Zunge', 20.0112, 73.7909);
```

To re-run, build the CSV again, import it into the empty staging table, and run
the copy statement. For a file that is too large for Table Editor, run
`npm run places:build -- --split 20000` and import the smaller files one at a
time. Place data © GeoNames (CC BY 4.0).
