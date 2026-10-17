'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  fromLeafletLatLng,
  toLeafletTuple,
  type LatLngCoords,
} from '@/lib/geo/esri-coords'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Esri Official Raster Basemap Tile endpoints (ArcGIS Location Platform)
// Doc: https://developers.arcgis.com/documentation/mapping-and-location-services/data-hosting/services/image-tile-service/
const ESRI_IMAGERY_URL =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_STREET_URL =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'

const SATELLITE_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

const STREET_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community'

interface MapControllerProps {
  flyTarget: { coords: LatLngCoords; zoom: number } | null
}

function MapController({ flyTarget }: MapControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(toLeafletTuple(flyTarget.coords), flyTarget.zoom, {
        duration: 1.2,
      })
    }
  }, [flyTarget, map])

  return null
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: LatLngCoords) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(fromLeafletLatLng(e.latlng))
    },
  })
  return null
}

export interface EsriMapViewProps {
  layer: 'satellite' | 'street'
  apiKey: string
  pinCoords: LatLngCoords | null
  onPinChange: (coords: LatLngCoords) => void
  flyTarget: { coords: LatLngCoords; zoom: number } | null
  defaultCenter?: LatLngCoords
  defaultZoom?: number
}

export function EsriMapView({
  layer,
  apiKey,
  pinCoords,
  onPinChange,
  flyTarget,
  defaultCenter = { latitude: 19.9747, longitude: 74.2193 }, // Khedle Zunge default center
  defaultZoom = 13,
}: EsriMapViewProps) {
  const tileUrl = useMemo(() => {
    const base = layer === 'satellite' ? ESRI_IMAGERY_URL : ESRI_STREET_URL
    return apiKey ? `${base}?token=${encodeURIComponent(apiKey)}` : base
  }, [layer, apiKey])

  const centerTuple = useMemo(
    () => toLeafletTuple(pinCoords || defaultCenter),
    [pinCoords, defaultCenter],
  )

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-border shadow-sm sm:h-[500px]">
      <MapContainer
        center={centerTuple}
        zoom={defaultZoom}
        maxZoom={22}
        className="h-full w-full"
        scrollWheelZoom
      >
        <MapController flyTarget={flyTarget} />
        <MapClickHandler onMapClick={onPinChange} />

        {/* Render only ONE TileLayer at a time with a unique key to prevent pre-loading hidden layers */}
        {layer === 'satellite' ? (
          <TileLayer
            key="esri-satellite-tile-layer"
            url={tileUrl}
            attribution={SATELLITE_ATTRIBUTION}
            maxNativeZoom={19}
            maxZoom={22}
          />
        ) : (
          <TileLayer
            key="esri-street-tile-layer"
            url={tileUrl}
            attribution={STREET_ATTRIBUTION}
            maxNativeZoom={18}
            maxZoom={22}
          />
        )}

        {pinCoords && (
          <Marker
            position={toLeafletTuple(pinCoords)}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as L.Marker
                const pos = marker.getLatLng()
                onPinChange(fromLeafletLatLng(pos))
              },
            }}
          >
            <Popup>
              <div className="space-y-1 p-1 text-xs">
                <p className="font-semibold text-text-primary">Selected Location</p>
                <p>
                  <span className="font-medium text-text-secondary">Latitude:</span>{' '}
                  <span className="font-mono">{pinCoords.latitude.toFixed(6)}</span>
                </p>
                <p>
                  <span className="font-medium text-text-secondary">Longitude:</span>{' '}
                  <span className="font-mono">{pinCoords.longitude.toFixed(6)}</span>
                </p>
                <p className="italic text-text-secondary">Drag marker to adjust</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
