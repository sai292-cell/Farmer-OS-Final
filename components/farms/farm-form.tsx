'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

const schema = z.object({
  name: z.string().trim().min(1),
  land_type: z.enum(['owned', 'leased', 'rented', 'shared']),
  survey_number: z.string().optional(),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
})
type Values = z.infer<typeof schema>

export function FarmForm({ farm }: { farm?: Partial<Values> & { id?: string; location?: { coordinates?: [number, number] } | null } }) {
  const t = useTranslations('farms')
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { land_type: 'owned', ...farm } })
  const save = async (values: Values) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const result = farm?.id
      ? await supabase.from('farms').update(values).eq('id', farm.id).select('id').single()
      : await supabase.from('farms').insert({ ...values, owner_id: user.id }).select('id').single()
    if (result.error) {
      form.setError('name', { message: t('saveError') })
      return
    }
    if (!farm?.id) analytics.trackEvent('farm_created')
    router.push(`/farms/${result.data.id}`)
    router.refresh()
  }
  const useLocation = () => {
    if (!navigator.geolocation) {
      form.setError('name', { message: t('locationUnavailable') })
      return
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      if (!farm?.id) {
        form.setError('name', { message: t('saveBeforeLocation') })
        return
      }
      const supabase = createClient()
      const point = `POINT(${position.coords.longitude} ${position.coords.latitude})`
      const { error } = await supabase.from('farms').update({ location: point }).eq('id', farm.id)
      if (error) form.setError('name', { message: t('locationError') })
      else analytics.trackEvent('gps_location_used')
    }, () => form.setError('name', { message: t('locationDenied') }), { enableHighAccuracy: true, timeout: 15000 })
  }
  return (
    <form onSubmit={form.handleSubmit(save)} className="space-y-4">
      {(['name', 'survey_number', 'village', 'taluka', 'district', 'state', 'notes'] as const).map((field) => (
        <label key={field} className="block space-y-1 text-sm font-semibold text-text-primary">
          {t(field)}
          {field === 'notes' ? <textarea {...form.register(field)} rows={3} className="min-h-[96px] w-full rounded-2xl border border-border bg-surface p-3 font-normal" /> :
            <input {...form.register(field)} className="min-h-[48px] w-full rounded-2xl border border-border bg-surface px-3 font-normal" />}
        </label>
      ))}
      <label className="block space-y-1 text-sm font-semibold text-text-primary">
        {t('landType')}
        <select {...form.register('land_type')} className="min-h-[48px] w-full rounded-2xl border border-border bg-surface px-3 font-normal">
          {(['owned', 'leased', 'rented', 'shared'] as const).map((value) => <option key={value} value={value}>{t(value)}</option>)}
        </select>
      </label>
      {farm?.id && <Button type="button" variant="outline" className="min-h-[48px] w-full rounded-2xl" onClick={useLocation}><MapPin className="mr-2 h-4 w-4" />{t('useLocation')}</Button>}
      <Button type="submit" className="min-h-[48px] w-full rounded-2xl" disabled={form.formState.isSubmitting}>{t('save')}</Button>
      {form.formState.errors.name?.message && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
    </form>
  )
}
