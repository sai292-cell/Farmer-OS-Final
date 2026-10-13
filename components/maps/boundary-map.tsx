'use client'

import { MapContainer, Marker, Polygon, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { analytics } from '@/lib/analytics'

const icon = new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })
type Point = [number, number]
type Focus = { point?: Point; bounds?: [number, number, number, number] } | null

function ClickHandler({ onAdd }: { onAdd: (point: Point) => void }) {
  useMapEvents({ click: (event) => onAdd([event.latlng.lng, event.latlng.lat]) })
  return null
}

function MapController({ focus, onLocation, onLocationError }: { focus: Focus; onLocation: (point: Point, accuracy: number) => void; onLocationError: () => void }) {
  const map = useMap()
  useEffect(() => {
    if (focus?.bounds) map.fitBounds([[focus.bounds[1], focus.bounds[0]], [focus.bounds[3], focus.bounds[2]]], { padding: [24, 24] })
    else if (focus?.point) map.setView([focus.point[1], focus.point[0]], 16)
  }, [focus, map])
  useEffect(() => {
    const onLocationFound = (event: L.LocationEvent) => {
      map.setView(event.latlng, Math.max(map.getZoom(), 17))
      onLocation([event.latlng.lng, event.latlng.lat], event.accuracy)
    }
    map.on('locationfound', onLocationFound)
    const onError = () => onLocationError()
    map.on('locationerror', onError)
    return () => { map.off('locationfound', onLocationFound); map.off('locationerror', onError) }
  }, [map, onLocation, onLocationError])
  return null
}

function LocationButton({ label }: { label: string }) {
  const map = useMap()
  return <Button type="button" variant="outline" className="min-h-[48px] rounded-2xl" onClick={() => { map.locate({ setView: false, enableHighAccuracy: true, timeout: 10000 }); }}>{label}</Button>
}

export function BoundaryMap({ points, onAdd, onMove, readOnly = false, focus = null, defaultCenter, defaultZoom = 5, onLocation, onLocationError = () => undefined, onLayerChange }: { points: Point[]; onAdd?: (point: Point) => void; onMove?: (index: number, point: Point) => void; readOnly?: boolean; focus?: Focus; defaultCenter?: Point; defaultZoom?: number; onLocation?: (point: Point, accuracy: number) => void; onLocationError?: () => void; onLayerChange?: (layer: 'street' | 'satellite') => void }) {
  const t = useTranslations('boundary')
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [layer, setLayer] = useState<'street' | 'satellite'>(() => typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ? (localStorage.getItem('farmeros-map-layer') as 'street' | 'satellite' || 'satellite') : 'street')
  const center: LatLngExpression = defaultCenter ? [defaultCenter[1], defaultCenter[0]] : points.length ? [points[0][1], points[0][0]] : [19.7515, 75.7139]
  const leafletPoints = points.map(([lng, lat]) => [lat, lng] as LatLngExpression)
  const streetUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const satelliteUrl = process.env.NEXT_PUBLIC_SATELLITE_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  const attribution = layer === 'satellite' ? process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION || 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community' : '&copy; OpenStreetMap contributors'
  const changeLayer = (value: 'street' | 'satellite') => { setLayer(value); localStorage.setItem('farmeros-map-layer', value); onLayerChange?.(value); analytics.trackEvent('map_layer_changed', { layer: value }) }
  const handleLocation = (point: Point, accuracy: number) => { setLocationAccuracy(accuracy); onLocation?.(point, accuracy) }
  return <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2"><div className="flex rounded-2xl border border-border bg-surface p-1"><Button type="button" size="sm" variant={layer === 'street' ? 'default' : 'ghost'} className="min-h-[44px] rounded-xl" onClick={() => changeLayer('street')}>{t('mapLayer')}</Button>{process.env.NEXT_PUBLIC_SATELLITE_TILE_URL && <Button type="button" size="sm" variant={layer === 'satellite' ? 'default' : 'ghost'} className="min-h-[44px] rounded-xl" onClick={() => changeLayer('satellite')}>{t('satelliteLayer')}</Button>}</div>{onLocation && <LocationButton label={t('goToLocation')} />}{locationAccuracy !== null && <span className="text-xs text-text-secondary">{t('accuracy')}: {locationAccuracy.toFixed(1)} m</span>}</div>
    <MapContainer center={center} zoom={defaultZoom} maxZoom={Number(process.env.NEXT_PUBLIC_SATELLITE_MAX_ZOOM || 19)} className="h-[360px] w-full rounded-3xl" scrollWheelZoom>
      <TileLayer key={layer} url={layer === 'satellite' ? satelliteUrl : streetUrl} attribution={attribution} maxNativeZoom={Number(process.env.NEXT_PUBLIC_SATELLITE_MAX_ZOOM || 19)} />
      <MapController focus={focus} onLocation={handleLocation} onLocationError={onLocationError} />
      {!readOnly && onAdd && <ClickHandler onAdd={onAdd} />}
      {leafletPoints.length >= 3 && <Polygon positions={leafletPoints} pathOptions={{ color: layer === 'satellite' ? '#fff' : '#1b5e20', weight: 4, fillColor: '#73b77a', fillOpacity: 0.3 }} />}
      {!readOnly && points.map((point, index) => <Marker key={`${point[0]}-${point[1]}-${index}`} position={[point[1], point[0]]} icon={icon} draggable eventHandlers={{ dragend: (event) => { const position = event.target.getLatLng(); onMove?.(index, [position.lng, position.lat]) } }} />)}
    </MapContainer>
  </div>
}
