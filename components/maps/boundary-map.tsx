'use client'

import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'

const icon = new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] })
type Point = [number, number]

function ClickHandler({ onAdd }: { onAdd: (point: Point) => void }) {
  useMapEvents({ click: (event) => onAdd([event.latlng.lng, event.latlng.lat]) })
  return null
}

export function BoundaryMap({ points, onAdd, onMove, readOnly = false }: { points: Point[]; onAdd?: (point: Point) => void; onMove?: (index: number, point: Point) => void; readOnly?: boolean }) {
  const center: LatLngExpression = points.length ? [points[0][1], points[0][0]] : [20.5937, 78.9629]
  useEffect(() => {
    if (!points.length) return
  }, [points])
  const leafletPoints = points.map(([lng, lat]) => [lat, lng] as LatLngExpression)
  return <MapContainer center={center} zoom={points.length ? 17 : 5} className="h-[360px] w-full rounded-3xl" scrollWheelZoom>
    <TileLayer url={process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution="&copy; OpenStreetMap contributors" />
    {!readOnly && onAdd && <ClickHandler onAdd={onAdd} />}
    {leafletPoints.length >= 3 && <Polygon positions={leafletPoints} pathOptions={{ color: '#2f7d32', fillColor: '#73b77a', fillOpacity: 0.25 }} />}
    {!readOnly && points.map((point, index) => <Marker key={`${point[0]}-${point[1]}-${index}`} position={[point[1], point[0]]} icon={icon} draggable eventHandlers={{ dragend: (event) => { const position = event.target.getLatLng(); onMove?.(index, [position.lng, position.lat]) } }} />)}
  </MapContainer>
}
