'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { AlertCircle, CheckCircle2, Layers, Loader2, MapPin, Navigation, Search, Tag, X } from 'lucide-react'
import { MapErrorBoundary } from '@/components/maps/map-error-boundary'
import { fromEsriPoint, type LatLngCoords } from '@/lib/geo/esri-coords'

// Safe pattern: single dynamic import with ssr: false
const EsriMapView = dynamic(
  () => import('./esri-map-view').then((mod) => mod.EsriMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-border bg-surface sm:h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-3 text-sm text-text-secondary">Loading Esri map tiles...</span>
      </div>
    ),
  },
)

interface EsriCandidate {
  address: string
  location: { x: number; y: number }
  score: number
  attributes?: {
    Addr_type?: string
    Type?: string
    Place_addr?: string
    PlaceName?: string
  }
}

function getZoomLevelForCandidate(candidate: EsriCandidate): number {
  const type = (candidate.attributes?.Type || '').toLowerCase()
  const addrType = (candidate.attributes?.Addr_type || '').toLowerCase()

  if (
    type.includes('village') ||
    type.includes('hamlet') ||
    type.includes('locality') ||
    type.includes('neighborhood') ||
    addrType === 'pointaddress' ||
    addrType === 'streetaddress' ||
    addrType === 'locality'
  ) {
    return 17
  }

  if (
    type.includes('town') ||
    type.includes('city') ||
    type.includes('municipality') ||
    addrType === 'city'
  ) {
    return 13
  }

  if (
    type.includes('district') ||
    type.includes('subregion') ||
    type.includes('county') ||
    type.includes('state') ||
    type.includes('region') ||
    addrType === 'admin'
  ) {
    return 11
  }

  return 15
}

export function EsriMapTestClient() {
  const apiKey = process.env.NEXT_PUBLIC_ESRI_API_KEY || ''
  const [layer, setLayer] = useState<'satellite' | 'street'>('satellite')

  // Labels overlay for satellite imagery (on by default, remembered in localStorage)
  const [showLabels, setShowLabels] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('farmeros-esri-satellite-labels')
    return saved !== null ? saved === 'true' : true
  })

  const [pinName, setPinName] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('Khedle Zunge, Niphad, Nashik')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<EsriCandidate[]>([])
  const [searchResultMarker, setSearchResultMarker] = useState<{
    coords: LatLngCoords
    label: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pinCoords, setPinCoords] = useState<LatLngCoords>({
    latitude: 19.9747,
    longitude: 74.2193,
  })
  const [flyTarget, setFlyTarget] = useState<{ coords: LatLngCoords; zoom: number } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Map debug state (zoom and center lat/lon)
  const [mapState, setMapState] = useState<{ zoom: number; center: LatLngCoords }>({
    zoom: 13,
    center: { latitude: 19.9747, longitude: 74.2193 },
  })

  const handleToggleLabels = () => {
    setShowLabels((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('farmeros-esri-satellite-labels', String(next))
      }
      return next
    })
  }

  const handleSearch = async () => {
    const trimmed = searchQuery.trim()
    setErrorMessage(null)

    if (trimmed.length < 3) {
      setErrorMessage('Please enter at least 3 characters to search.')
      return
    }

    if (!apiKey) {
      setErrorMessage(
        'Esri API key is missing. Please set NEXT_PUBLIC_ESRI_API_KEY in your .env.local file and restart the development server.',
      )
      return
    }

    setIsSearching(true)
    setSearchResults([])

    try {
      const params = new URLSearchParams({
        singleLine: trimmed,
        countryCode: 'IND',
        maxLocations: '5',
        outFields: 'Addr_type,Type,Place_addr,PlaceName',
        f: 'json',
        token: apiKey,
        forStorage: 'false',
      })

      const response = await fetch(
        `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params.toString()}`,
      )

      if (response.status === 403 || response.status === 498 || response.status === 499) {
        setErrorMessage(
          'Invalid token or blocked referrer. Please verify your Esri API key and check that http://localhost:3000 is allowed in your ArcGIS Developer dashboard.',
        )
        setIsSearching(false)
        return
      }

      if (!response.ok) {
        setErrorMessage(`Geocoding server error (${response.status}). Please try again later.`)
        setIsSearching(false)
        return
      }

      const data = await response.json()

      if (data.error) {
        const code = data.error.code
        const msg = (data.error.message || '').toLowerCase()
        if (code === 498 || code === 499 || code === 403 || msg.includes('token') || msg.includes('referrer')) {
          setErrorMessage(
            'Invalid token or blocked referrer. Please verify your Esri API key and check that http://localhost:3000 is allowed in your ArcGIS Developer dashboard.',
          )
        } else {
          setErrorMessage(data.error.message || 'Error executing geocoding query.')
        }
        setIsSearching(false)
        return
      }

      const candidates: EsriCandidate[] = data.candidates || []
      if (candidates.length === 0) {
        setErrorMessage('No results found for this search. Please try another place name.')
      } else {
        setSearchResults(candidates)
      }
    } catch {
      setErrorMessage(
        'Network error while connecting to Esri geocoding service. Please check your internet connection.',
      )
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (candidate: EsriCandidate) => {
    // Esri point coordinates: x is longitude, y is latitude
    const coords = fromEsriPoint({
      x: candidate.location.x,
      y: candidate.location.y,
    })
    const zoom = getZoomLevelForCandidate(candidate)
    setPinCoords(coords)
    setSearchResultMarker({
      coords,
      label: candidate.address,
    })
    setFlyTarget({ coords, zoom })
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setLocationStatus(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const coords: LatLngCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        const acc = Math.round(position.coords.accuracy)
        setLocationAccuracy(acc)
        setLocationStatus(`Location acquired (accuracy: ±${acc}m)`)
        setPinCoords(coords)
        setFlyTarget({ coords, zoom: 17 })
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Please enable location permissions in your browser.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus('Location unavailable. GPS signal could not be acquired.')
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus('Location request timed out. Please try again.')
        } else {
          setLocationStatus('Unable to determine location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Dev Page Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h1 className="text-base font-bold sm:text-lg">
            Isolated Test: Esri ArcGIS Satellite, Place Labels & Geocoding
          </h1>
        </div>
        <p className="mt-1 text-xs text-emerald-800 sm:text-sm">
          Testing Esri ArcGIS Location Platform raster tiles (World_Imagery, World_Street_Map), hybrid place/boundary labels overlay, custom place labels, and non-stored place search in India.
        </p>
      </div>

      {/* Layer Toggles, Labels Switch & Geolocation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLayer('satellite')}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
              layer === 'satellite'
                ? 'bg-primary text-white shadow'
                : 'border border-border bg-surface text-text-secondary hover:bg-background'
            }`}
          >
            <Layers className="h-4 w-4" />
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setLayer('street')}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
              layer === 'street'
                ? 'bg-primary text-white shadow'
                : 'border border-border bg-surface text-text-secondary hover:bg-background'
            }`}
          >
            <Layers className="h-4 w-4" />
            Street
          </button>

          {/* Satellite Labels On/Off Switch */}
          {layer === 'satellite' && (
            <button
              type="button"
              onClick={handleToggleLabels}
              title="Toggle official Esri place/village labels overlay on satellite imagery"
              className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                showLabels
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-border bg-surface text-text-secondary hover:bg-background'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Labels: {showLabels ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-primary/30 bg-primary-surface px-4 text-sm font-semibold text-primary-dark transition hover:bg-primary-surface/80 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Go to my location
        </button>
      </div>

      {locationStatus && (
        <p className="text-xs font-medium text-text-secondary">
          {locationStatus}
          {locationAccuracy !== null && ` (${locationAccuracy}m)`}
        </p>
      )}

      {/* Map Display */}
      <MapErrorBoundary
        message="Failed to load map. Please check your network and API key configuration."
        reloadLabel="Reload Map"
      >
        <EsriMapView
          layer={layer}
          showLabels={showLabels}
          apiKey={apiKey}
          pinCoords={pinCoords}
          pinName={pinName}
          onPinChange={setPinCoords}
          flyTarget={flyTarget}
          searchResult={searchResultMarker}
          onMapStateChange={setMapState}
        />
      </MapErrorBoundary>

      {/* Tiny Debug Panel (Dev Page Only - shows zoom level, center lat/lon, and active layers) */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3.5 text-white shadow-sm font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-emerald-400">
              Map Debug Monitor (Dev Only)
            </span>
          </div>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
            No keys or coordinates logged to console
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-800/80 p-2.5">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-sans">
              Current Zoom
            </span>
            <span className="mt-0.5 block text-lg font-bold text-amber-300">
              Zoom {mapState.zoom}
            </span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2.5">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-sans">
              Center Latitude
            </span>
            <span className="mt-0.5 block text-sm font-bold text-slate-100">
              {mapState.center.latitude.toFixed(6)}° N
            </span>
          </div>
          <div className="rounded-xl bg-slate-800/80 p-2.5">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-sans">
              Center Longitude
            </span>
            <span className="mt-0.5 block text-sm font-bold text-slate-100">
              {mapState.center.longitude.toFixed(6)}° E
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-[11px]">
          <div>
            <span className="text-slate-400">Active Layers: </span>
            <span className="font-semibold text-emerald-300">
              {layer === 'satellite'
                ? `Esri World_Imagery (Satellite)${showLabels ? ' + Esri Labels Overlay (arcgis/imagery/labels)' : ' [Labels OFF]'}`
                : 'Esri World_Street_Map (Street)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Report at which zoom village names appear
          </span>
        </div>
      </div>

      {/* Selected Coordinates & Own Place Name Card */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Selected Coordinates (Draggable Pin)</h2>
          </div>
          {searchResultMarker && (
            <button
              type="button"
              onClick={() => setSearchResultMarker(null)}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-600"
            >
              <X className="h-3 w-3" />
              Remove search marker
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Latitude
            </span>
            <p className="mt-0.5 font-mono text-base font-bold text-text-primary">
              {pinCoords.latitude.toFixed(6)}
            </p>
            <span className="text-[11px] text-text-secondary">North / South (Y-axis)</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Longitude
            </span>
            <p className="mt-0.5 font-mono text-base font-bold text-text-primary">
              {pinCoords.longitude.toFixed(6)}
            </p>
            <span className="text-[11px] text-text-secondary">East / West (X-axis)</span>
          </div>
        </div>

        {/* Task 2: Own place label input */}
        <div className="rounded-xl border border-border/60 bg-background p-3.5 space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="pin-name-input" className="text-xs font-bold text-text-primary">
              Name this place (custom map label):
            </label>
            {searchResultMarker && (
              <button
                type="button"
                onClick={() => setPinName(searchResultMarker.label)}
                className="self-start text-xs font-semibold text-primary hover:underline sm:self-auto"
              >
                Use search result name
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="pin-name-input"
              type="text"
              value={pinName}
              onChange={(e) => setPinName(e.target.value)}
              placeholder="e.g. Khedle Zunge"
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {pinName && (
              <button
                type="button"
                onClick={() => setPinName('')}
                className="h-11 shrink-0 rounded-xl border border-border px-3 text-xs font-medium text-text-secondary hover:bg-background"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-secondary">
            {pinName.trim()
              ? `Showing permanent daylight label "${pinName.trim()}" directly above the pin marker on the map.`
              : 'Type a name above to show a permanent daylight-readable label directly on the map (works even if Esri does not know the village).'}
          </p>
        </div>

        <p className="text-xs text-text-secondary">
          Click anywhere on the map or drag the pin marker to update coordinates.
        </p>
      </div>

      {/* Place Search Card */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-bold text-text-primary">Search Indian Place / Village</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Uses Esri World Geocoding Service (non-stored mode, countryCode=IND). Click Search or press Enter.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="mt-3 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Khedle Zunge, Niphad, Nashik"
              className="h-12 w-full rounded-xl border border-border bg-background px-3.5 pr-10 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </form>

        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p>{errorMessage}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-text-secondary">
              Search Results ({searchResults.length}) — Tap to fly & mark on map:
            </p>
            <div className="space-y-1.5">
              {searchResults.map((result, idx) => {
                const isSelected = searchResultMarker?.label === result.address
                return (
                  <button
                    key={`${result.address}-${idx}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-primary bg-primary-surface/40'
                        : 'border-border/80 bg-background hover:border-primary/50 hover:bg-primary-surface/30'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {result.address}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {result.attributes?.Type ? `Type: ${result.attributes.Type} • ` : ''}
                        Lat: {result.location.y.toFixed(5)}, Lon: {result.location.x.toFixed(5)}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-lg bg-primary-surface px-2 py-1 text-xs font-semibold text-primary-dark">
                      Match: {Math.round(result.score)}%
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
