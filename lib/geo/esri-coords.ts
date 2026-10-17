/**
 * CRITICAL COORDINATE CONVERSION UTILITY
 *
 * Leaflet and Esri / GeoJSON use opposing coordinate conventions:
 *
 * 1. Leaflet:
 *    - Uses [latitude, longitude] tuple format (Latitude first, Longitude second).
 *    - LatLng object: { lat: number, lng: number }
 *    - Latitude is Y (North/South: -90 to +90).
 *    - Longitude is X (East/West: -180 to +180).
 *
 * 2. Esri REST API / GeoJSON / ArcGIS Location Services:
 *    - Uses { x: longitude, y: latitude }
 *    - GeoJSON Point: [longitude, latitude]
 *    - x = Longitude
 *    - y = Latitude
 *
 * NEVER mix these up. Always use these explicit converters.
 */

export interface LatLngCoords {
  latitude: number
  longitude: number
}

export interface EsriPoint {
  x: number // Longitude
  y: number // Latitude
}

/**
 * Convert Esri { x, y } point to standard LatLngCoords
 */
export function fromEsriPoint(point: EsriPoint): LatLngCoords {
  return {
    latitude: point.y,
    longitude: point.x,
  }
}

/**
 * Convert standard LatLngCoords to Leaflet [lat, lng] tuple
 */
export function toLeafletTuple(coords: LatLngCoords): [number, number] {
  return [coords.latitude, coords.longitude]
}

/**
 * Convert Leaflet lat/lng object to standard LatLngCoords
 */
export function fromLeafletLatLng(latlng: { lat: number; lng: number }): LatLngCoords {
  return {
    latitude: latlng.lat,
    longitude: latlng.lng,
  }
}

/**
 * Convert standard LatLngCoords to Esri { x, y } point
 */
export function toEsriPoint(coords: LatLngCoords): EsriPoint {
  return {
    x: coords.longitude,
    y: coords.latitude,
  }
}
