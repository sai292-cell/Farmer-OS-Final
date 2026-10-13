'use client'

import dynamic from 'next/dynamic'
import type { Coordinate } from '@/lib/geo/boundary'
const BoundaryMap = dynamic(() => import('./boundary-map').then((module) => module.BoundaryMap), { ssr: false })

export function BoundaryHistoryMap({ survey }: { survey: { raw_points: unknown } }) {
  const points = Array.isArray(survey.raw_points) ? survey.raw_points.map((point) => {
    const value = point as { longitude?: number; latitude?: number }
    return [Number(value.longitude), Number(value.latitude)] as Coordinate
  }).filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat)) : []
  return points.length >= 3 ? <div className="mt-4"><BoundaryMap points={points} readOnly /></div> : null
}
