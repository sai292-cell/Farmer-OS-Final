import { area as turfArea } from '@turf/area'
import { distance } from '@turf/distance'
import { lineString, point, polygon } from '@turf/helpers'
import { length } from '@turf/length'

export type Coordinate = [number, number]

export const STRAIGHTNESS_THRESHOLDS = {
  straightMeters: 2,
  slightlyCurvedMeters: 8,
} as const

export const GUNTHA_SQM = 101.17141056

export function closeRing(points: Coordinate[]): Coordinate[] {
  if (points.length === 0) return []
  const first = points[0]
  const last = points[points.length - 1]
  return first[0] === last[0] && first[1] === last[1] ? points : [...points, first]
}

export function calculatePreview(points: Coordinate[]) {
  const ring = closeRing(points)
  if (ring.length < 4) return { areaSqm: 0, perimeterM: 0 }
  const shape = polygon([ring])
  return { areaSqm: turfArea(shape), perimeterM: length(lineString(ring), { units: 'kilometers' }) * 1000 }
}

export function convertArea(areaSqm: number) {
  return {
    squareMetres: areaSqm,
    hectares: areaSqm / 10_000,
    acres: areaSqm / 4046.8564224,
    guntha: areaSqm / GUNTHA_SQM,
  }
}

function pointToSegmentDistanceMeters(candidate: Coordinate, start: Coordinate, end: Coordinate) {
  const line = lineString([start, end])
  const startDistance = distance(point(candidate), point(start), { units: 'kilometers' })
  const endDistance = distance(point(candidate), point(end), { units: 'kilometers' })
  const lineLength = length(line, { units: 'kilometers' })
  const fraction = lineLength === 0 ? 0 : Math.min(1, Math.max(0, startDistance / (startDistance + endDistance || 1)))
  const projected: Coordinate = [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ]
  return distance(point(candidate), point(projected), { units: 'kilometers' }) * 1000
}

export function classifyStraightness(points: Coordinate[]) {
  if (points.length < 3) return { label: 'straight' as const, maxDeviationM: 0 }
  const start = points[0]
  const end = points[points.length - 1]
  const maxDeviationM = Math.max(...points.slice(1, -1).map((p) => pointToSegmentDistanceMeters(p, start, end)), 0)
  const label = maxDeviationM <= STRAIGHTNESS_THRESHOLDS.straightMeters
    ? 'straight'
    : maxDeviationM <= STRAIGHTNESS_THRESHOLDS.slightlyCurvedMeters ? 'slightly_curved' : 'irregular'
  return { label, maxDeviationM }
}

export function calculateSides(points: Coordinate[]) {
  const ring = closeRing(points)
  return ring.slice(0, -1).map((start, index) => {
    const end = ring[index + 1]
    const lengthM = distance(point(start), point(end), { units: 'kilometers' }) * 1000
    const bearing = ((Math.atan2(
      Math.sin((end[0] - start[0]) * Math.PI / 180) * Math.cos(end[1] * Math.PI / 180),
      Math.cos(start[1] * Math.PI / 180) * Math.sin(end[1] * Math.PI / 180) -
      Math.sin(start[1] * Math.PI / 180) * Math.cos(end[1] * Math.PI / 180) *
      Math.cos((end[0] - start[0]) * Math.PI / 180),
    ) * 180 / Math.PI) + 360) % 360
    const compass = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(bearing / 45) % 8]
    const shape = classifyStraightness(points.slice(index, index + 2))
    return { index, start, end, length_m: Number(lengthM.toFixed(2)), bearing_degrees: Number(bearing.toFixed(1)), compass, straightness: shape.label, max_deviation_m: shape.maxDeviationM }
  })
}
