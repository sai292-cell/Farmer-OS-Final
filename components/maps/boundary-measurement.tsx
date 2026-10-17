'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { analytics } from '@/lib/analytics'
import { calculatePreview, calculateSides, closeRing, convertArea, MAX_WARNING_ACRES, type Coordinate } from '@/lib/geo/boundary'
import { createClient } from '@/lib/supabase/client'
import { MapErrorBoundary } from './map-error-boundary'

const BoundaryMap = dynamic(() => import('./boundary-map').then((module) => module.BoundaryMap), {
  ssr: false,
  loading: () => <div className="h-[460px] rounded-3xl bg-primary-surface sm:h-[520px]" />,
})

const accuracyLimit = Number(process.env.NEXT_PUBLIC_GPS_ACCURACY_THRESHOLD_M || 20)
type SearchResult = {
  id?: number
  name: string
  name_local?: string | null
  place_type: string
  district?: string | null
  state?: string | null
  population?: number | null
  lat: number
  lng: number
  match_level?: string
  score?: number
}

function focusForResult(result: SearchResult) {
  const placeType = (result.place_type || '').toLowerCase()
  const zoom = ['village', 'hamlet', 'locality', 'sublocality', 'neighborhood', 'pointaddress', 'streetaddress'].some(
    (t) => placeType.includes(t)
  )
    ? 18
    : ['town', 'city', 'municipality'].some((t) => placeType.includes(t))
    ? 14
    : ['district', 'subregion', 'state', 'admin'].some((t) => placeType.includes(t))
    ? 11
    : 16

  return {
    point: [result.lng, result.lat] as Coordinate,
    zoom,
    label: result.name_local ? `${result.name} (${result.name_local})` : result.name,
  }
}

export function BoundaryMeasurement({
  farmId,
  plotId,
  initialPoints = [],
  defaultCenter,
  initialVillage = '',
  fallbackAreas = { taluka: '', district: '' },
}: {
  farmId: string
  plotId?: string
  initialPoints?: Coordinate[]
  defaultCenter?: Coordinate
  initialVillage?: string
  fallbackAreas?: { taluka: string; district: string }
}) {
  const t = useTranslations('boundary')
  const router = useRouter()
  const [method, setMethod] = useState<'drawn_on_map' | 'walked_gps'>('drawn_on_map')
  const [points, setPoints] = useState<Coordinate[]>(initialPoints)
  const pointsRef = useRef<Coordinate[]>(points)
  pointsRef.current = points

  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [notes, setNotes] = useState('')
  const [unit, setUnit] = useState(() => (typeof window === 'undefined' ? 'acres' : localStorage.getItem('farmeros-area-unit') || 'acres'))
  const [message, setMessage] = useState('')
  const [focus, setFocus] = useState<{ point?: Coordinate; bounds?: [number, number, number, number]; zoom?: number; label?: string } | null>(
    initialPoints.length ? { bounds: boundsFor(initialPoints) } : null
  )
  const [search, setSearch] = useState(initialVillage)
  const [results, setResults] = useState<SearchResult[]>([])
  const [confirmedLargeArea, setConfirmedLargeArea] = useState(false)
  const lastSearchTermRef = useRef<string>('')

  const preview = useMemo(() => calculatePreview(points), [points])
  const values = convertArea(preview.areaSqm)
  const isLarge = values.acres > MAX_WARNING_ACRES

  useEffect(() => () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  }, [watchId])

  const searchPlace = useCallback(
    async (queryOverride?: string) => {
      const trimmed = (queryOverride ?? search).trim()
      lastSearchTermRef.current = trimmed

      const coordinateMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
      if (coordinateMatch) {
        const lat = Number(coordinateMatch[1])
        const lon = Number(coordinateMatch[2])
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          setFocus({ point: [lon, lat], zoom: 18 })
          setResults([])
          analytics.trackEvent('map_search_used')
          return
        }
      }

      if (trimmed.length < 3) {
        setMessage(t('searchTooShort'))
        return
      }

      // 1. Try Esri Geocoding
      const esriKey = process.env.NEXT_PUBLIC_ESRI_API_KEY
      if (esriKey) {
        try {
          const esriParams = new URLSearchParams({
            singleLine: trimmed,
            countryCode: 'IND',
            maxLocations: '6',
            outFields: 'Addr_type,Type,Place_addr,PlaceName',
            f: 'json',
            token: esriKey,
            forStorage: 'false',
          })
          const res = await fetch(
            `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${esriParams.toString()}`
          )
          if (res.ok) {
            const data = await res.json()
            const candidates = (data.candidates || []) as Array<{
              address: string
              location: { x: number; y: number }
              attributes?: { Type?: string; Addr_type?: string }
            }>
            if (candidates.length > 0) {
              const mapped: SearchResult[] = candidates.map((c, idx) => ({
                id: idx + 2000,
                name: c.address,
                place_type: c.attributes?.Type || c.attributes?.Addr_type || 'village',
                lat: c.location.y,
                lng: c.location.x,
              }))
              setResults(mapped)
              setFocus(focusForResult(mapped[0]))
              setMessage('')
              analytics.trackEvent('map_search_used')
              return
            }
          }
        } catch {
          // Fall through to database / API geocode fallbacks
        }
      }

      // 2. Try Supabase local places table
      try {
        const supabase = createClient()
        const currentPoints = pointsRef.current
        const nearPoint = defaultCenter || (currentPoints.length ? currentPoints[0] : undefined)
        const { data, error } = await supabase.rpc('search_places', {
          q: trimmed,
          near_lat: nearPoint?.[1] ?? null,
          near_lng: nearPoint?.[0] ?? null,
          max_results: 8,
        })
        if (!error && data) {
          const localResults = data as SearchResult[]
          if (localResults.length) {
            setResults(localResults)
            setFocus(focusForResult(localResults[0]))
            setMessage('')
            analytics.trackEvent('map_search_used')
            return
          }
        }
      } catch {
        // Continue to fallback area
      }

      // 3. Fallback area (taluka / district)
      const fallback = fallbackAreas.taluka || fallbackAreas.district
      if (fallback) {
        try {
          const supabase = createClient()
          const currentPoints = pointsRef.current
          const nearPoint = defaultCenter || (currentPoints.length ? currentPoints[0] : undefined)
          const fallbackResponse = await supabase.rpc('search_places', {
            q: fallback,
            near_lat: nearPoint?.[1] ?? null,
            near_lng: nearPoint?.[0] ?? null,
            max_results: 1,
          })
          const fallbackResult = (fallbackResponse.data || [])[0] as SearchResult | undefined
          if (fallbackResult) {
            setResults([])
            setFocus(focusForResult(fallbackResult))
            setMessage(t('fallbackArea', { area: fallback }))
            analytics.trackEvent('map_search_used')
            return
          }
        } catch {
          // Continue to /api/geocode fallback
        }
      }

      // 4. Fallback to /api/geocode route
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          headers: { 'Accept-Language': document.documentElement.lang || 'en' },
        })
        if (!response.ok) {
          setMessage(response.status === 429 ? t('searchRateLimited') : t('searchUnavailable'))
          return
        }
        const dataFallback = (await response.json()) as Array<{
          display_name: string
          type: string
          lat: string
          lon: string
        }>
        if (dataFallback && dataFallback.length > 0) {
          const fallbackResults: SearchResult[] = dataFallback.map((item, idx) => ({
            id: idx + 1000,
            name: item.display_name,
            place_type: item.type || 'village',
            lat: Number(item.lat),
            lng: Number(item.lon),
          }))
          setResults(fallbackResults)
          setFocus(focusForResult(fallbackResults[0]))
          setMessage('')
          analytics.trackEvent('map_search_used')
        } else {
          setResults([])
          setMessage(t('noSearchResults'))
        }
      } catch {
        setMessage(t('searchUnavailable'))
      }
    },
    [defaultCenter, fallbackAreas, search, t]
  )

  // Only trigger debounced search when user types in search box
  useEffect(() => {
    const trimmed = search.trim()
    if (trimmed.length < 3 || trimmed === lastSearchTermRef.current) return
    const timer = window.setTimeout(() => void searchPlace(trimmed), 500)
    return () => window.clearTimeout(timer)
  }, [search, searchPlace])

  const beginWalking = () => {
    if (!navigator.geolocation) {
      setMessage(t('gpsUnavailable'))
      return
    }
    analytics.trackEvent('boundary_started', { method: 'walked_gps' })
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setAccuracy(position.coords.accuracy)
        if (!paused && Number.isFinite(position.coords.accuracy) && position.coords.accuracy <= accuracyLimit) {
          const point: Coordinate = [position.coords.longitude, position.coords.latitude]
          setPoints((current) =>
            current.length && current[current.length - 1][0] === point[0] && current[current.length - 1][1] === point[1]
              ? current
              : [...current, point]
          )
        }
      },
      () => setMessage(t('gpsDenied')),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    )
    setWatchId(id)
  }

  const save = async () => {
    if (points.length < 3) {
      setMessage(t('needThreePoints'))
      return
    }
    const supabase = createClient()
    const ring = closeRing(points)
    const wkt = `SRID=4326;POLYGON((${ring.map(([lng, lat]) => `${lng} ${lat}`).join(',')}))`
    const { error } = await supabase.from('boundary_surveys').insert({
      farm_id: farmId,
      plot_id: plotId || null,
      owner_id: (await supabase.auth.getUser()).data.user?.id,
      polygon: wkt,
      raw_points: points.map(([longitude, latitude]) => ({ longitude, latitude })),
      method,
      sides: calculateSides(points),
      notes: notes || null,
    })
    if (error) {
      setMessage(error.message)
      return
    }
    analytics.trackEvent('boundary_saved', { method })
    router.push(`/farms/${farmId}?boundarySaved=1#boundary-history`)
  }

  const locate = (point: Coordinate, locationAccuracy: number) => {
    setAccuracy(locationAccuracy)
    setFocus({ point, zoom: 18 })
    analytics.trackEvent('gps_location_used')
  }

  const setPreferredUnit = (value: string) => {
    setUnit(value)
    localStorage.setItem('farmeros-area-unit', value)
  }

  return (
    <div className="space-y-5">
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
        {t('legalNotice')}
      </p>

      {/* Village / Place Search */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void searchPlace()
            }}
            placeholder={t('searchPlaceholder')}
            className="min-h-[48px] min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="button" className="min-h-[48px] rounded-2xl font-bold px-5" onClick={() => void searchPlace()}>
            {t('search')}
          </Button>
        </div>
        <p className="text-[11px] font-medium text-text-muted">{t('searchAttribution')}</p>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-border bg-surface p-2 shadow-sm">
          {results.map((result) => (
            <button
              type="button"
              key={`${result.id}-${result.lat}-${result.lng}`}
              className="flex min-h-[48px] w-full flex-col justify-center rounded-xl px-3 py-2 text-left hover:bg-primary-surface/40 transition-colors"
              onClick={() => {
                setFocus(focusForResult(result))
                setResults([])
              }}
            >
              <span className="font-bold text-sm text-text-primary">
                {result.name}
                {result.name_local ? ` (${result.name_local})` : ''}
              </span>
              <span className="text-xs text-text-muted">
                {result.place_type}
                {result.district ? ` · ${result.district}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Measurement Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {(['drawn_on_map', 'walked_gps'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={method === value ? 'default' : 'outline'}
            className="min-h-[48px] rounded-2xl font-bold"
            onClick={() => {
              setMethod(value)
              if (value === 'walked_gps') analytics.trackEvent('boundary_started', { method: value })
            }}
          >
            {t(value)}
          </Button>
        ))}
      </div>

      {/* Interactive Map */}
      <MapErrorBoundary message={t('mapCrashed')} reloadLabel={t('reloadMap')}>
        <BoundaryMap
          points={points}
          defaultCenter={defaultCenter}
          defaultZoom={defaultCenter ? 18 : 6}
          focus={focus}
          onLocation={locate}
          onLocationError={() => setMessage(t('locationError'))}
          onAdd={(point) => {
            if (method === 'drawn_on_map') {
              setFocus(null)
              setPoints((current) => [...current, point])
            }
          }}
          onMove={(index, point) => {
            setFocus(null)
            setPoints((current) => current.map((value, currentIndex) => (currentIndex === index ? point : value)))
          }}
        />
      </MapErrorBoundary>

      {!points.length && <p className="rounded-2xl bg-primary-surface p-3 text-xs font-semibold text-primary-dark">{t('mapHint')}</p>}

      {accuracy !== null && (
        <p className="text-xs font-semibold text-text-secondary">
          {t('accuracy')}: {accuracy.toFixed(1)} m
        </p>
      )}

      {/* Points Coordinates Ribbon */}
      {points.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-text-secondary">Boundary Corners ({points.length} points recorded):</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {points.map((point, index) => (
              <div
                key={`${point.join('-')}-${index}`}
                className="flex items-center justify-between rounded-xl border border-border/80 bg-surface px-3 py-2 text-xs font-semibold tabular-nums shadow-xs"
              >
                <span className="text-primary-dark">P{index + 1}:</span>
                <span className="text-text-secondary">
                  {point[1].toFixed(5)}, {point[0].toFixed(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {method === 'drawn_on_map' ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] rounded-2xl font-bold"
              disabled={!points.length}
              onClick={() => {
                setFocus(null)
                setPoints((current) => current.slice(0, -1))
              }}
            >
              {t('undo')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] rounded-2xl font-bold text-destructive hover:bg-red-50"
              disabled={!points.length}
              onClick={() => {
                setFocus(null)
                setPoints([])
              }}
            >
              {t('clear')}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              className="min-h-[48px] rounded-2xl font-bold"
              onClick={beginWalking}
              disabled={watchId !== null}
            >
              {t('startWalking')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] rounded-2xl font-bold"
              disabled={watchId === null}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? t('resume') : t('pause')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-[48px] rounded-2xl font-bold"
              disabled={watchId === null}
              onClick={() => {
                if (watchId !== null) navigator.geolocation.clearWatch(watchId)
                setWatchId(null)
              }}
            >
              {t('finish')}
            </Button>
          </>
        )}
      </div>

      {/* Real-time Geodesic Area Preview */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-text-primary">{t('preview')}</h2>
          <select
            value={unit}
            onChange={(event) => setPreferredUnit(event.target.value)}
            className="min-h-[44px] rounded-xl border border-border bg-background px-3 text-xs font-bold text-text-primary"
          >
            {(['acres', 'hectares', 'squareMetres', 'guntha'] as const).map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-primary-dark tabular-nums tracking-tight">
          {values[unit as keyof typeof values].toFixed(2)} {t(unit)}
        </p>
        <p className="mt-1 text-xs font-semibold text-text-secondary">
          {t('perimeter')}: {preview.perimeterM.toFixed(2)} m
        </p>
      </div>

      {/* Large Area Warning */}
      {isLarge && (
        <label className="block rounded-2xl border border-amber-400 bg-amber-50 p-4 text-xs font-medium text-amber-950 sm:text-sm">
          <p className="font-bold">{t('largeAreaWarning')}</p>
          <span className="mt-3 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedLargeArea}
              onChange={(event) => setConfirmedLargeArea(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded-md accent-primary"
            />
            <span>{t('largeAreaConfirm')}</span>
          </span>
        </label>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="boundary_notes" className="text-xs font-bold text-text-primary">
          {t('notes')}
        </label>
        <textarea
          id="boundary_notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder={t('notes')}
          className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Button
        type="button"
        className="min-h-[56px] w-full rounded-2xl text-base font-bold shadow-md"
        onClick={save}
        disabled={isLarge && !confirmedLargeArea}
      >
        {t('save')}
      </Button>

      {message && <p className="rounded-2xl border border-border bg-surface p-3 text-xs font-semibold text-text-secondary">{message}</p>}
    </div>
  )
}

function boundsFor(points: Coordinate[]): [number, number, number, number] {
  const lngs = points.map(([lng]) => lng)
  const lats = points.map(([, lat]) => lat)
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]
}
