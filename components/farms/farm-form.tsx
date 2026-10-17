'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, FileText, LoaderCircle, MapPin, Sprout, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

const landClassifications = ['jirayat', 'bagayat', 'tari', 'padh'] as const
const irrigationSources = ['borewell', 'well', 'canal', 'farm_pond', 'river', 'rainfed', 'other'] as const
const pumpTypes = ['grid_electric', 'solar_kusum', 'diesel', 'none'] as const

const schema = z.object({
  name: z.string().trim().min(1),
  land_type: z.enum(['owned', 'leased', 'rented', 'shared']),
  survey_number: z.string().optional(),
  sub_division_number: z.string().optional(),
  khata_number: z.string().optional(),
  land_classification: z.enum(landClassifications).optional().nullable(),
  area_gunthas: z.number().optional().nullable(),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  irrigation_source: z.enum(irrigationSources).optional().nullable(),
  pump_type: z.enum(pumpTypes).optional().nullable(),
  notes: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function FarmForm({
  farm,
}: {
  farm?: Partial<Values> & { id?: string; location?: { coordinates?: [number, number] } | null }
}) {
  const t = useTranslations('farms')
  const router = useRouter()
  const [gpsSuccess, setGpsSuccess] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: farm?.name ?? '',
      land_type: farm?.land_type ?? 'owned',
      survey_number: farm?.survey_number ?? '',
      sub_division_number: farm?.sub_division_number ?? '',
      khata_number: farm?.khata_number ?? '',
      land_classification: farm?.land_classification ?? null,
      area_gunthas: farm?.area_gunthas ?? null,
      village: farm?.village ?? '',
      taluka: farm?.taluka ?? '',
      district: farm?.district ?? '',
      state: farm?.state ?? 'Maharashtra',
      pincode: farm?.pincode ?? '',
      irrigation_source: farm?.irrigation_source ?? null,
      pump_type: farm?.pump_type ?? null,
      notes: farm?.notes ?? '',
    },
  })

  const save = async (values: Values) => {
    setNotice(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const corePayload = {
      name: values.name,
      land_type: values.land_type,
      survey_number: values.survey_number || null,
      village: values.village || null,
      taluka: values.taluka || null,
      district: values.district || null,
      state: values.state || null,
      notes: values.notes || null,
    }

    const extendedPayload = {
      ...corePayload,
      sub_division_number: values.sub_division_number || null,
      khata_number: values.khata_number || null,
      land_classification: values.land_classification || null,
      area_gunthas: values.area_gunthas || null,
      pincode: values.pincode || null,
      irrigation_source: values.irrigation_source || null,
      pump_type: values.pump_type || null,
    }

    let targetId = farm?.id
    let error: any = null

    if (farm?.id) {
      const res = await supabase.from('farms').update(extendedPayload).eq('id', farm.id).select('id').single()
      error = res.error
      if (error) {
        // Fallback to core payload if columns don't exist yet
        const coreRes = await supabase.from('farms').update(corePayload).eq('id', farm.id).select('id').single()
        if (coreRes.error) {
          form.setError('name', { message: t('saveError') })
          return
        }
        targetId = farm.id
      }
    } else {
      const res = await supabase
        .from('farms')
        .insert({ ...extendedPayload, owner_id: user.id })
        .select('id')
        .single()
      error = res.error
      if (error) {
        const coreRes = await supabase
          .from('farms')
          .insert({ ...corePayload, owner_id: user.id })
          .select('id')
          .single()
        if (coreRes.error) {
          form.setError('name', { message: t('saveError') })
          return
        }
        targetId = coreRes.data?.id
        analytics.trackEvent('farm_created')
      } else if (res.data) {
        targetId = res.data.id
        analytics.trackEvent('farm_created')
      }
    }

    if (targetId) {
      router.push(`/farms/${targetId}`)
      router.refresh()
    }
  }

  const useLocation = () => {
    setGpsSuccess(false)
    if (!navigator.geolocation) {
      form.setError('name', { message: t('locationUnavailable') })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!farm?.id) {
          form.setError('name', { message: t('saveBeforeLocation') })
          return
        }
        const supabase = createClient()
        const point = `POINT(${position.coords.longitude} ${position.coords.latitude})`
        const { error } = await supabase.from('farms').update({ location: point }).eq('id', farm.id)
        if (error) {
          form.setError('name', { message: t('locationError') })
        } else {
          setGpsSuccess(true)
          analytics.trackEvent('gps_location_used')
        }
      },
      () => form.setError('name', { message: t('locationDenied') }),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <form onSubmit={form.handleSubmit(save)} className="space-y-6">
      {/* Group 1: Land Title & Revenue Record (7/12 & 8-A) */}
      <div className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-bold text-text-primary">Land & Revenue Record (7/12 & 8-A)</h3>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="farm_name" className="text-xs font-bold text-text-primary">
            {t('name')} *
          </label>
          <input
            id="farm_name"
            {...form.register('name')}
            placeholder="e.g. East Well Farm / शेताचे नाव"
            className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="survey_number" className="text-xs font-bold text-text-primary">
              {t('survey_number')}
            </label>
            <input
              id="survey_number"
              {...form.register('survey_number')}
              placeholder="e.g. 142/2 or Gut 85"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sub_division_number" className="text-xs font-bold text-text-primary">
              {t('subDivisionNumber')}
            </label>
            <input
              id="sub_division_number"
              {...form.register('sub_division_number')}
              placeholder="e.g. Hissa 1-A"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="khata_number" className="text-xs font-bold text-text-primary">
              {t('khataNumber')}
            </label>
            <input
              id="khata_number"
              {...form.register('khata_number')}
              placeholder="8-A Khata No."
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="land_type" className="text-xs font-bold text-text-primary">
              {t('landType')}
            </label>
            <select
              id="land_type"
              {...form.register('land_type')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              {(['owned', 'leased', 'rented', 'shared'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="land_classification" className="text-xs font-bold text-text-primary">
              {t('landClassification')}
            </label>
            <select
              id="land_classification"
              {...form.register('land_classification')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="">Not selected</option>
              {landClassifications.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="area_gunthas" className="text-xs font-bold text-text-primary">
              {t('areaGunthas')}
            </label>
            <input
              id="area_gunthas"
              type="number"
              step="0.01"
              {...form.register('area_gunthas', {
                setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v)),
              })}
              placeholder="e.g. 40 Gunthas (1 Acre)"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Group 2: Location & Revenue Jurisdiction */}
      <div className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-bold text-text-primary">Village & Administrative Location</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="farm_village" className="text-xs font-bold text-text-primary">
              {t('village')}
            </label>
            <input
              id="farm_village"
              {...form.register('village')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="farm_taluka" className="text-xs font-bold text-text-primary">
              {t('taluka')}
            </label>
            <input
              id="farm_taluka"
              {...form.register('taluka')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="farm_district" className="text-xs font-bold text-text-primary">
              {t('district')}
            </label>
            <input
              id="farm_district"
              {...form.register('district')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="farm_state" className="text-xs font-bold text-text-primary">
              {t('state')}
            </label>
            <input
              id="farm_state"
              {...form.register('state')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="sm:w-1/2">
          <div className="space-y-1.5">
            <label htmlFor="farm_pincode" className="text-xs font-bold text-text-primary">
              {t('pincode')}
            </label>
            <input
              id="farm_pincode"
              maxLength={6}
              {...form.register('pincode')}
              placeholder="e.g. 411001"
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Group 3: Irrigation & Agricultural Infrastructure */}
      <div className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sprout className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-bold text-text-primary">Water & Power Infrastructure</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="irrigation_source" className="text-xs font-bold text-text-primary">
              {t('irrigationSource')}
            </label>
            <select
              id="irrigation_source"
              {...form.register('irrigation_source')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="">Not selected</option>
              {irrigationSources.map((is) => (
                <option key={is} value={is}>
                  {t(is)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pump_type" className="text-xs font-bold text-text-primary">
              {t('pumpType')}
            </label>
            <select
              id="pump_type"
              {...form.register('pump_type')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="">Not selected</option>
              {pumpTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {t(pt)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="farm_notes" className="text-xs font-bold text-text-primary">
            {t('notes')}
          </label>
          <textarea
            id="farm_notes"
            {...form.register('notes')}
            rows={3}
            placeholder="Additional notes about soil, slope, or land agreements..."
            className="min-h-[88px] w-full rounded-2xl border border-border bg-background p-3.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* GPS Geo-Tagging Button */}
      {farm?.id && (
        <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-text-primary">GPS Farm Center Coordinate</p>
            <p className="text-xs font-medium text-text-secondary">
              Record a high-accuracy GPS point for this farm while standing on the field.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-[48px] rounded-2xl font-bold"
            onClick={useLocation}
          >
            {gpsSuccess ? <Check className="mr-2 h-4 w-4 text-primary" /> : <MapPin className="mr-2 h-4 w-4 text-primary" />}
            {gpsSuccess ? 'GPS Point Saved' : t('useLocation')}
          </Button>
        </div>
      )}

      {form.formState.errors.name?.message && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-status-alert">
          {form.formState.errors.name.message}
        </p>
      )}

      <Button
        type="submit"
        className="min-h-[56px] w-full rounded-2xl text-base font-bold shadow-md"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin mr-2" /> : null}
        {t('save')}
      </Button>
    </form>
  )
}
