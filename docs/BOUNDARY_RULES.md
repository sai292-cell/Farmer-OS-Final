# Boundary measurement rules

FarmerOS keeps the points the farmer records. It does not smooth, move, or
silently correct them.

## Side straightness

The original points between two corners are compared with the straight line
between those corners. The thresholds are in
[`lib/geo/boundary.ts`](../lib/geo/boundary.ts):

- `0–2 m`: straight
- `>2–8 m`: slightly curved
- `>8 m`: irregular

The maximum deviation is stored with each side. A side with only two points is
reported as straight because there is no intermediate point to classify.

## GPS accuracy

Walking mode uses the browser GPS watch. Points whose reported accuracy is
worse than `NEXT_PUBLIC_GPS_ACCURACY_THRESHOLD_M` are not recorded. The default
is 20 metres. The farmer is shown the accuracy and can add a corner only when
the current point meets the threshold.

## Units

The database stores square metres computed by PostGIS. The screen also shows:

- 1 hectare = 10,000 square metres
- 1 acre = 4,046.8564224 square metres
- 1 Maharashtra guntha = 101.17141056 square metres (40 guntha = 1 acre)

## Legal notice

This is a digital measurement and record-keeping tool. It does not prove
ownership, title or a legal survey. For legal matters, official land and survey
records and authorised surveyors are the authority.

## Map layers and search

Street maps use the configured `NEXT_PUBLIC_MAP_TILE_URL`, defaulting to
OpenStreetMap standard tiles. Satellite maps use the configured
`NEXT_PUBLIC_SATELLITE_TILE_URL`; the UI has an Esri World Imagery fallback and
shows the configured or default Esri attribution. The satellite maximum native
zoom is configurable so tiles stretch instead of becoming blank beyond the
provider's imagery zoom.

Place search uses the server-only `GEOCODER_URL`, defaulting to OpenStreetMap
Nominatim. Nominatim requires an identifying user agent, at most one request per
second, and no heavy use. The route has a small in-memory per-user limit for
development; production needs a shared rate-limit store. Use paid tile and
geocoding providers for production, keep credentials in server environment
variables, and preserve each provider's attribution and usage terms.
