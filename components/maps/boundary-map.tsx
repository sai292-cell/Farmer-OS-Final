'use client'

import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { analytics } from '@/lib/analytics'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Point = [number, number]
type Focus = { point?: Point; bounds?: [number, number, number, number]; zoom?: number; label?: string } | null

function ClickHandler({ onAdd }: { onAdd: (point: Point) => void }) {
  useMapEvents({ click: (event) => onAdd([event.latlng.lng, event.latlng.lat]) })
  return null
}

function MapController({
  focus,
  locateRequest,
  onLocation,
  onLocationError,
}: {
  focus: Focus
  locateRequest: number
  onLocation: (point: Point, accuracy: number) => void
  onLocationError: () => void
}) {
  const map = useMap()
  const lastTargetRef = useRef<string | null>(null)

  useEffect(() => {
    if (!focus) return

    const key = focus.bounds
      ? `bounds:${focus.bounds.join(',')}`
      : focus.point
      ? `point:${focus.point[0].toFixed(6)},${focus.point[1].toFixed(6)}:${focus.zoom || 17}`
      : null

    if (!key || key === lastTargetRef.current) return
    lastTargetRef.current = key

    if (focus?.bounds) {
      const [west, south, east, north] = focus.bounds
      if ([west, south, east, north].every(Number.isFinite)) {
        map.flyToBounds(
          [
            [south, west],
            [north, east],
          ],
          { padding: [24, 24], maxZoom: 18, duration: 0.8 }
        )
      }
    } else if (focus?.point && focus.point.every(Number.isFinite)) {
      map.flyTo([focus.point[1], focus.point[0]], focus.zoom || 17, { duration: 0.8 })
    }
  }, [focus, map])

  useEffect(() => {
    if (locateRequest > 0) {
      map.locate({ setView: false, enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
    }
  }, [locateRequest, map])

  useEffect(() => {
    const onLocationFound = (event: L.LocationEvent) => {
      map.setView(event.latlng, Math.max(map.getZoom(), 18))
      onLocation([event.latlng.lng, event.latlng.lat], event.accuracy)
    }
    map.on('locationfound', onLocationFound)
    const onError = () => onLocationError()
    map.on('locationerror', onError)
    return () => {
      map.off('locationfound', onLocationFound)
      map.off('locationerror', onError)
    }
  }, [map, onLocation, onLocationError])

  return null
}

function FocusMarker({ focus }: { focus: Focus }) {
  if (!focus?.point || !focus.label || !focus.point.every(Number.isFinite)) return null
  return (
    <Marker position={[focus.point[1], focus.point[0]]} icon={icon}>
      <Tooltip permanent direction="top" offset={[0, -36]}>
        {focus.label}
      </Tooltip>
    </Marker>
  )
}

export function BoundaryMap({
  points,
  onAdd,
  onMove,
  readOnly = false,
  focus = null,
  defaultCenter,
  defaultZoom = 5,
  onLocation,
  onLocationError = () => undefined,
  onLayerChange,
}: {
  points: Point[]
  onAdd?: (point: Point) => void
  onMove?: (index: number, point: Point) => void
  readOnly?: boolean
  focus?: Focus
  defaultCenter?: Point
  defaultZoom?: number
  onLocation?: (point: Point, accuracy: number) => void
  onLocationError?: () => void
  onLayerChange?: (layer: 'street' | 'satellite') => void
}) {
  const t = useTranslations('boundary')
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [locateRequest, setLocateRequest] = useState(0)
  const [layer, setLayer] = useState<'street' | 'satellite'>(() => {
    if (typeof window === 'undefined') return 'satellite'
    const savedLayer = localStorage.getItem('farmeros-map-layer')
    return savedLayer === 'satellite' || savedLayer === 'street' ? savedLayer : 'satellite'
  })

  const center: LatLngExpression = defaultCenter
    ? [defaultCenter[1], defaultCenter[0]]
    : points.length
    ? [points[0][1], points[0][0]]
    : [19.7515, 75.7139]

  const leafletPoints = points.map(([lng, lat]) => [lat, lng] as LatLngExpression)
  const streetUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const satelliteUrl =
    process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ||
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  const esriKey = process.env.NEXT_PUBLIC_ESRI_API_KEY || ''
  const satelliteLabelsUrl = esriKey
    ? `https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/labels/static/tile/{z}/{y}/{x}?token=${encodeURIComponent(esriKey)}`
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

  const attribution =
    layer === 'satellite'
      ? process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION ||
        'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      : '&copy; OpenStreetMap contributors'

  const maxZoom = 22
  const maxNativeZoom = 18

  const changeLayer = (value: 'street' | 'satellite') => {
    setLayer(value)
    localStorage.setItem('farmeros-map-layer', value)
    onLayerChange?.(value)
    analytics.trackEvent('map_layer_changed', { layer: value })
  }

  const handleLocation = (point: Point, accuracy: number) => {
    setLocationAccuracy(accuracy)
    onLocation?.(point, accuracy)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-2xl border border-border bg-surface p-1 shadow-xs">
          <Button
            type="button"
            size="sm"
            variant={layer === 'street' ? 'default' : 'ghost'}
            className="min-h-[44px] rounded-xl font-bold"
            onClick={() => changeLayer('street')}
          >
            {t('defaultLayer')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layer === 'satellite' ? 'default' : 'ghost'}
            className="min-h-[44px] rounded-xl font-bold"
            onClick={() => changeLayer('satellite')}
          >
            {t('satelliteLayer')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onLocation && (
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] rounded-2xl font-bold"
              onClick={() => setLocateRequest((value) => value + 1)}
            >
              {t('goToLocation')}
            </Button>
          )}
          {locationAccuracy !== null && (
            <span className="rounded-xl bg-primary-surface px-2.5 py-1 text-xs font-semibold text-primary-dark">
              {t('accuracy')}: {locationAccuracy.toFixed(1)} m
            </span>
          )}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={defaultZoom}
        minZoom={3}
        maxZoom={maxZoom}
        className="h-[460px] w-full rounded-3xl border border-border shadow-card sm:h-[520px]"
        scrollWheelZoom
      >
        <TileLayer
          key={layer}
          url={layer === 'satellite' ? satelliteUrl : streetUrl}
          attribution={attribution}
          maxNativeZoom={maxNativeZoom}
          maxZoom={maxZoom}
        />
        {layer === 'satellite' && (
          <TileLayer
            key="satellite-labels"
            url={satelliteLabelsUrl}
            attribution="Labels &copy; Esri"
            maxNativeZoom={18}
            maxZoom={maxZoom}
            opacity={0.95}
          />
        )}
        <MapController
          focus={focus}
          locateRequest={locateRequest}
          onLocation={handleLocation}
          onLocationError={onLocationError}
        />
        <FocusMarker focus={focus} />
        {!readOnly && onAdd && <ClickHandler onAdd={onAdd} />}
        {leafletPoints.length >= 3 && (
          <Polygon
            positions={leafletPoints}
            pathOptions={{
              color: layer === 'satellite' ? '#ffffff' : '#1b5e20',
              weight: 4,
              fillColor: '#73b77a',
              fillOpacity: 0.35,
            }}
          />
        )}
        {!readOnly &&
          points.map((point, index) => (
            <Marker
              key={`${point[0]}-${point[1]}-${index}`}
              position={[point[1], point[0]]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const position = event.target.getLatLng()
                  onMove?.(index, [position.lng, position.lat])
                },
              }}
            />
          ))}
      </MapContainer>
    </div>
  )
}
