'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Check, LoaderCircle, LogOut } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { analytics } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/client'
import { farmerTypes, profileCompleteness, profileLanguages, type Profile, type ProfileFormValues } from '@/lib/profile'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations('profile')
  const locale = useLocale()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const schema = z.object({
    full_name: z.string(),
    phone: z.string(),
    preferred_language: z.enum(profileLanguages),
    village: z.string(),
    taluka: z.string(),
    district: z.string(),
    state: z.string().min(1, t('required')),
    farmer_type: z.enum(farmerTypes).nullable(),
    years_farming: z.number().int().min(0).nullable(),
    primary_crops: z.string(),
    voice_first: z.boolean(),
    low_literacy_mode: z.boolean(),
  })
  const initialValues: ProfileFormValues = useMemo(() => ({
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    preferred_language: profile.preferred_language,
    village: profile.village ?? '',
    taluka: profile.taluka ?? '',
    district: profile.district ?? '',
    state: profile.state,
    farmer_type: profile.farmer_type,
    years_farming: profile.years_farming,
    primary_crops: profile.primary_crops?.join(', ') ?? '',
    voice_first: profile.voice_first,
    low_literacy_mode: profile.low_literacy_mode,
  }), [profile])
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  })
  const values = useWatch({ control })
  const completeness = profileCompleteness({ ...initialValues, ...values })
  const saveMutation = useMutation({
    mutationFn: async (formValues: ProfileFormValues) => {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({
        full_name: formValues.full_name || null,
        phone: formValues.phone || null,
        preferred_language: formValues.preferred_language,
        village: formValues.village || null,
        taluka: formValues.taluka || null,
        district: formValues.district || null,
        state: formValues.state,
        farmer_type: formValues.farmer_type,
        years_farming: formValues.years_farming,
        primary_crops: formValues.primary_crops.split(',').map((crop) => crop.trim()).filter(Boolean),
        voice_first: formValues.voice_first,
        low_literacy_mode: formValues.low_literacy_mode,
        profile_completed: completeness === 100,
      }).eq('id', profile.id)
      if (error) throw error
      return formValues.preferred_language
    },
    onSuccess: (savedLanguage) => {
      analytics.trackEvent('profile_saved')
      setMessage({ type: 'success', text: t('saved') })
      if (savedLanguage !== locale) {
        analytics.trackEvent('language_changed', { from: locale, to: savedLanguage })
        router.replace('/profile', { locale: savedLanguage })
      } else {
        router.refresh()
      }
    },
    onError: () => setMessage({ type: 'error', text: t('saveError') }),
  })
  const onSubmit = (formValues: ProfileFormValues) => saveMutation.mutate(formValues)

  const signOut = async () => {
    const { error } = await createClient().auth.signOut()
    if (error) {
      setMessage({ type: 'error', text: t('signOutError') })
      return
    }
    analytics.trackEvent('sign_out')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4"><h2 className="font-bold text-text-primary">{t('completeness')}</h2><span className="text-lg font-bold text-primary-dark">{completeness}%</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-primary-surface"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completeness}%` }} /></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-text-primary">{t('personal')}</h2><ProvenanceBadge value="farmerEntered" /></div>
        <Field label={t('fullName')} name="full_name" register={register} />
        <Field label={t('phone')} name="phone" register={register} type="tel" />
        <div className="space-y-2"><label htmlFor="preferred_language" className="text-sm font-semibold">{t('preferredLanguage')}</label><select id="preferred_language" {...register('preferred_language')} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 text-base"><option value="en">{t('english')}</option><option value="mr">{t('marathi')}</option><option value="hi">{t('hindi')}</option></select></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('village')} name="village" register={register} />
          <Field label={t('taluka')} name="taluka" register={register} />
          <Field label={t('district')} name="district" register={register} />
          <Field label={t('state')} name="state" register={register} error={errors.state?.message} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><label htmlFor="farmer_type" className="text-sm font-semibold">{t('farmerType')}</label><select id="farmer_type" {...register('farmer_type')} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 text-base"><option value="">{t('notSet')}</option>{farmerTypes.map((type) => <option key={type} value={type}>{t(type)}</option>)}</select></div>
          <div className="space-y-2"><label htmlFor="years_farming" className="text-sm font-semibold">{t('yearsFarming')}</label><input id="years_farming" type="number" min="0" {...register('years_farming', { valueAsNumber: true, setValueAs: (value) => Number.isNaN(value) ? null : value })} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 text-base" /></div>
        </div>
        <Field label={t('primaryCrops')} name="primary_crops" register={register} hint={t('primaryCropsHint')} />
        <div className="grid gap-3 sm:grid-cols-2"><label className="flex min-h-12 items-center gap-3 text-sm font-semibold"><input type="checkbox" {...register('voice_first')} className="h-5 w-5 accent-primary" />{t('voiceFirst')}</label><label className="flex min-h-12 items-center gap-3 text-sm font-semibold"><input type="checkbox" {...register('low_literacy_mode')} className="h-5 w-5 accent-primary" />{t('lowLiteracyMode')}</label></div>
        {message && <p role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-2xl p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-status-alert' : 'bg-primary-surface text-primary-dark'}`}>{message.text}</p>}
        <button type="submit" disabled={saveMutation.isPending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-white hover:bg-primary-dark disabled:opacity-60">{saveMutation.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}{t('save')}</button>
      </form>
      <button type="button" onClick={signOut} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 font-bold text-status-alert hover:bg-red-50"><LogOut className="h-5 w-5" />{t('signOut')}</button>
    </div>
  )
}

function Field({ label, name, register, type = 'text', hint, error }: { label: string; name: keyof ProfileFormValues; register: ReturnType<typeof useForm<ProfileFormValues>>['register']; type?: string; hint?: string; error?: string }) {
  return <div className="space-y-2"><label htmlFor={name} className="text-sm font-semibold">{label}</label><input id={name} type={type} {...register(name)} className="min-h-14 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none ring-primary focus:ring-2" />{hint && <p className="text-xs text-text-secondary">{hint}</p>}{error && <p className="text-sm text-status-alert">{error}</p>}</div>
}
