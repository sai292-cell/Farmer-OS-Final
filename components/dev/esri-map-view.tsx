'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
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

// Custom SVG marker for search results (self-contained, no network latency)
const searchMarkerIcon = L.divIcon({
  className: 'farmer-os-search-pin-wrapper',
  html: `
    <div style="position: relative; width: 30px; height: 42px; transform: translate(-15px, -42px); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
      <svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#1B5E20" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="15" cy="15" r="5.5" fill="#FFFFFF"/>
      </svg>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

// Esri Official Raster Basemap Tile endpoints (ArcGIS Location Platform)
// Doc: https://developers.arcgis.com/documentation/mapping-and-location-services/data-hosting/services/image-tile-service/
const ESRI_IMAGERY_URL =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_STREET_URL =
  'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'

// Esri Static Basemap Tiles Service Style for Imagery Labels (Modern ArcGIS Location Platform)
// Doc: https://developers.arcgis.com/documentation/mapping-and-location-services/data-hosting/services/static-basemap-tiles-service/
const ESRI_LABELS_URL =
  'https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/labels/static/tile/{z}/{y}/{x}'

// Reference World Boundaries and Places fallback (served directly by Esri)
const ESRI_LABELS_FALLBACK_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

const SATELLITE_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

const STREET_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community'

const LABELS_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Sources: Esri, Maxar, Earthstar Geographics, Garmin, and the GIS User Community'

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

// Custom Leaflet Pane setup to ensure labels render above imagery (zIndex 350)
// and never block clicks or interactions with the map (pointerEvents: none)
function LabelsPaneSetup() {
  const map = useMap()

  useEffect(() => {
    if (!map.getPane('esri-labels-pane')) {
      const pane = map.createPane('esri-labels-pane')
      pane.style.zIndex = '350'
      pane.style.pointerEvents = 'none'
    }
  }, [map])

  return null
}

// Map state observer to feed the live dev debug monitor without console logging
function MapStateObserver({
  onMapStateChange,
}: {
  onMapStateChange?: (state: { zoom: number; center: LatLngCoords }) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (onMapStateChange) {
      const c = map.getCenter()
      onMapStateChange({
        zoom: map.getZoom(),
        center: fromLeafletLatLng(c),
      })
    }
  }, [map, onMapStateChange])

  useMapEvents({
    moveend() {
      if (onMapStateChange) {
        const c = map.getCenter()
        onMapStateChange({
          zoom: map.getZoom(),
          center: fromLeafletLatLng(c),
        })
      }
    },
    zoomend() {
      if (onMapStateChange) {
        const c = map.getCenter()
        onMapStateChange({
          zoom: map.getZoom(),
          center: fromLeafletLatLng(c),
        })
      }
    },
  })

  return null
}

// Bulletproof tooltip helper that ensures map context and valid non-empty label
function SafePermanentTooltip({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  const map = useMap()
  const trimmed = label?.trim()

  if (!map || !trimmed) return null

  return (
    <Tooltip
      permanent
      direction="top"
      offset={[0, -42]}
      className={className || 'farmer-os-place-tooltip'}
    >
      <span>{trimmed}</span>
    </Tooltip>
  )
}

export interface EsriMapViewProps {
  layer: 'satellite' | 'street'
  showLabels?: boolean
  apiKey: string
  pinCoords: LatLngCoords | null
  pinName?: string
  onPinChange: (coords: LatLngCoords) => void
  flyTarget: { coords: LatLngCoords; zoom: number } | null
  searchResult?: { coords: LatLngCoords; label: string } | null
  onMapStateChange?: (state: { zoom: number; center: LatLngCoords }) => void
  defaultCenter?: LatLngCoords
  defaultZoom?: number
}

export function EsriMapView({
  layer,
  showLabels = true,
  apiKey,
  pinCoords,
  pinName,
  onPinChange,
  flyTarget,
  searchResult,
  onMapStateChange,
  defaultCenter = { latitude: 19.9747, longitude: 74.2193 }, // Khedle Zunge default center
  defaultZoom = 13,
}: EsriMapViewProps) {
  const tileUrl = useMemo(() => {
    const base = layer === 'satellite' ? ESRI_IMAGERY_URL : ESRI_STREET_URL
    return apiKey ? `${base}?token=${encodeURIComponent(apiKey)}` : base
  }, [layer, apiKey])

  const labelsTileUrl = useMemo(() => {
    if (apiKey) {
      return `${ESRI_LABELS_URL}?token=${encodeURIComponent(apiKey)}`
    }
    return ESRI_LABELS_FALLBACK_URL
  }, [apiKey])

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
        <LabelsPaneSetup />
        <MapStateObserver onMapStateChange={onMapStateChange} />

        {/* Base Tile Layer: single layer rendered at a time with unique key */}
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

        {/* Satellite Labels Overlay: ONLY rendered when Satellite is active AND showLabels is true */}
        {layer === 'satellite' && showLabels && (
          <TileLayer
            key="esri-satellite-labels-tile-layer"
            pane="esri-labels-pane"
            url={labelsTileUrl}
            attribution={LABELS_ATTRIBUTION}
            maxNativeZoom={19}
            maxZoom={22}
          />
        )}

        {/* Search Result Marker with its permanent label */}
        {searchResult &&
          Number.isFinite(searchResult.coords.latitude) &&
          Number.isFinite(searchResult.coords.longitude) && (
            <Marker
              position={toLeafletTuple(searchResult.coords)}
              icon={searchMarkerIcon}
            >
              <SafePermanentTooltip
                label={searchResult.label}
                className="farmer-os-search-tooltip"
              />
              <Popup>
                <div className="space-y-1 p-1 text-xs">
                  <p className="font-semibold text-text-primary">{searchResult.label}</p>
                  <p>
                    <span className="font-medium text-text-secondary">Latitude:</span>{' '}
                    <span className="font-mono">{searchResult.coords.latitude.toFixed(6)}</span>
                  </p>
                  <p>
                    <span className="font-medium text-text-secondary">Longitude:</span>{' '}
                    <span className="font-mono">{searchResult.coords.longitude.toFixed(6)}</span>
                  </p>
                  <p className="font-medium text-emerald-700">Search Result Location</p>
                </div>
              </Popup>
            </Marker>
          )}

        {/* Selected Draggable Pin with custom place label */}
        {pinCoords &&
          Number.isFinite(pinCoords.latitude) &&
          Number.isFinite(pinCoords.longitude) && (
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
              <SafePermanentTooltip label={pinName} />
              <Popup>
                <div className="space-y-1 p-1 text-xs">
                  <p className="font-semibold text-text-primary">
                    {pinName?.trim() ? pinName.trim() : 'Selected Pin Location'}
                  </p>
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
