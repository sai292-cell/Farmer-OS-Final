'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { analytics } from '@/lib/analytics'
import { calculatePreview, calculateSides, closeRing, convertArea, type Coordinate } from '@/lib/geo/boundary'
import { createClient } from '@/lib/supabase/client'

const BoundaryMap = dynamic(() => import('./boundary-map').then((module) => module.BoundaryMap), { ssr: false, loading: () => <div className="h-[360px] rounded-3xl bg-primary-surface" /> })
const accuracyLimit = Number(process.env.NEXT_PUBLIC_GPS_ACCURACY_THRESHOLD_M || 20)

export function BoundaryMeasurement({ farmId, plotId, initialPoints = [] }: { farmId: string; plotId?: string; initialPoints?: Coordinate[] }) {
  const t = useTranslations('boundary')
  const [method, setMethod] = useState<'drawn_on_map' | 'walked_gps'>('drawn_on_map')
  const [points, setPoints] = useState<Coordinate[]>(initialPoints)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [notes, setNotes] = useState('')
  const [unit, setUnit] = useState(() => typeof window === 'undefined' ? 'acres' : localStorage.getItem('farmeros-area-unit') || 'acres')
  const [message, setMessage] = useState('')
  const preview = useMemo(() => calculatePreview(points), [points])
  const values = convertArea(preview.areaSqm)
  useEffect(() => () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId) }, [watchId])
  const beginWalking = () => {
    if (!navigator.geolocation) { setMessage(t('gpsUnavailable')); return }
    analytics.trackEvent('boundary_started', { method: 'walked_gps' })
    const id = navigator.geolocation.watchPosition((position) => {
      setAccuracy(position.coords.accuracy)
      if (!paused && position.coords.accuracy <= accuracyLimit) {
        const point: Coordinate = [position.coords.longitude, position.coords.latitude]
        setPoints((current) => current.length && current[current.length - 1][0] === point[0] && current[current.length - 1][1] === point[1] ? current : [...current, point])
      }
    }, () => setMessage(t('gpsDenied')), { enableHighAccuracy: true, maximumAge: 2000 })
    setWatchId(id)
  }
  const stopWalking = () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); setWatchId(null) }
  const save = async () => {
    if (points.length < 3) { setMessage(t('needThreePoints')); return }
    const supabase = createClient()
    const ring = closeRing(points)
    const wkt = `SRID=4326;POLYGON((${ring.map(([lng, lat]) => `${lng} ${lat}`).join(',')}))`
    const { error } = await supabase.from('boundary_surveys').insert({ farm_id: farmId, plot_id: plotId || null, owner_id: (await supabase.auth.getUser()).data.user?.id, polygon: wkt, raw_points: points.map(([longitude, latitude]) => ({ longitude, latitude })), method, sides: calculateSides(points), notes: notes || null })
    if (error) { setMessage(error.message); return }
    analytics.trackEvent('boundary_saved', { method })
    setMessage(t('saved'))
  }
  const setPreferredUnit = (value: string) => { setUnit(value); localStorage.setItem('farmeros-area-unit', value) }
  return <div className="space-y-5">
    <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('legalNotice')}</p>
    <div className="flex flex-wrap gap-2">{(['drawn_on_map', 'walked_gps'] as const).map((value) => <Button key={value} type="button" variant={method === value ? 'default' : 'outline'} className="min-h-[48px] rounded-2xl" onClick={() => { setMethod(value); if (value === 'walked_gps') analytics.trackEvent('boundary_started', { method: value }) }}>{t(value)}</Button>)}</div>
    <BoundaryMap points={points} onAdd={(point) => method === 'drawn_on_map' && setPoints((current) => [...current, point])} onMove={(index, point) => setPoints((current) => current.map((value, currentIndex) => currentIndex === index ? point : value))} />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{points.map((point, index) => <div key={`${point.join('-')}-${index}`} className="rounded-xl bg-primary-surface p-2 text-xs">{index + 1}: {point[1].toFixed(5)}, {point[0].toFixed(5)}</div>)}</div>
    <div className="flex flex-wrap gap-2">
      {method === 'drawn_on_map' ? <><Button type="button" variant="outline" className="min-h-[48px] rounded-2xl" onClick={() => setPoints((current) => current.slice(0, -1))}>{t('undo')}</Button><Button type="button" variant="outline" className="min-h-[48px] rounded-2xl" onClick={() => setPoints([])}>{t('clear')}</Button></> :
        <><Button type="button" className="min-h-[48px] rounded-2xl" onClick={beginWalking} disabled={watchId !== null}>{t('startWalking')}</Button><Button type="button" variant="outline" className="min-h-[48px] rounded-2xl" onClick={() => setPaused((value) => !value)}>{paused ? t('resume') : t('pause')}</Button><Button type="button" variant="outline" className="min-h-[48px] rounded-2xl" onClick={stopWalking}>{t('finish')}</Button></>}
    </div>
    {method === 'walked_gps' && <p className="text-sm text-text-secondary">{accuracy === null ? t('accuracyWaiting') : `${t('accuracy')}: ${accuracy.toFixed(1)} m (${accuracy <= accuracyLimit ? t('accuracyGood') : t('accuracyPoor')})`}</p>}
    <div className="rounded-3xl border border-border bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{t('preview')}</h2><select value={unit} onChange={(event) => setPreferredUnit(event.target.value)} className="min-h-[48px] rounded-xl border border-border px-3">{(['acres', 'hectares', 'squareMetres', 'guntha'] as const).map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></div><p className="mt-2 text-2xl font-bold text-primary-dark">{values[unit as keyof typeof values].toFixed(2)} {t(unit)}</p><p className="text-sm text-text-secondary">{t('perimeter')}: {preview.perimeterM.toFixed(2)} m</p></div>
    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder={t('notes')} className="w-full rounded-2xl border border-border p-3" />
    <Button type="button" className="min-h-[48px] w-full rounded-2xl" onClick={save}>{t('save')}</Button>
    {message && <p className="text-sm text-text-secondary">{message}</p>}
  </div>
}
