'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  Award,
  Building2,
  Check,
  CreditCard,
  FileText,
  Landmark,
  LoaderCircle,
  LogOut,
  MapPin,
  ShieldCheck,
  Sprout,
  Tractor,
  User,
  Users,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { analytics } from '@/lib/analytics'
import { createClient } from '@/lib/supabase/client'
import {
  farmerTypes,
  farmingTypes,
  genders,
  profileCompleteness,
  profileLanguages,
  socialCategories,
  storageFacilities,
  type Profile,
  type ProfileFormValues,
} from '@/lib/profile'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations('profile')
  const locale = useLocale()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)

  const schema = z.object({
    full_name: z.string(),
    phone: z.string(),
    preferred_language: z.enum(profileLanguages),
    village: z.string(),
    taluka: z.string(),
    district: z.string(),
    state: z.string().min(1, t('required')),
    pincode: z.string(),
    farmer_type: z.enum(farmerTypes).nullable(),
    years_farming: z.number().int().min(0).nullable(),
    primary_crops: z.string(),
    voice_first: z.boolean(),
    low_literacy_mode: z.boolean(),

    // Government & Identity
    farmer_id: z.string(),
    aadhaar_last_four: z.string(),
    gender: z.enum(genders).nullable(),
    date_of_birth: z.string(),
    social_category: z.enum(socialCategories).nullable(),

    // Bank & DBT
    bank_name: z.string(),
    account_number_last_four: z.string(),
    ifsc_code: z.string(),
    dbt_enabled: z.boolean(),

    // Schemes
    pm_kisan_id: z.string(),
    kcc_holder: z.boolean(),
    kcc_limit: z.number().nullable(),
    pmfby_policy_number: z.string(),
    ration_card_number: z.string(),
    soil_health_card_number: z.string(),

    // Agriculture
    farming_type: z.enum(farmingTypes).nullable(),
    total_land_acres: z.number().nullable(),
    primary_irrigation_source: z.string(),
    machinery_owned: z.string(),
    livestock_owned: z.string(),
    storage_facility: z.enum(storageFacilities).nullable(),
  })

  const initialValues: ProfileFormValues = useMemo(
    () => ({
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      preferred_language: profile.preferred_language,
      village: profile.village ?? '',
      taluka: profile.taluka ?? '',
      district: profile.district ?? '',
      state: profile.state ?? 'Maharashtra',
      pincode: profile.pincode ?? '',
      farmer_type: profile.farmer_type,
      years_farming: profile.years_farming,
      primary_crops: profile.primary_crops?.join(', ') ?? '',
      voice_first: profile.voice_first ?? false,
      low_literacy_mode: profile.low_literacy_mode ?? false,

      farmer_id: profile.farmer_id ?? '',
      aadhaar_last_four: profile.aadhaar_last_four ?? '',
      gender: profile.gender ?? null,
      date_of_birth: profile.date_of_birth ?? '',
      social_category: profile.social_category ?? null,

      bank_name: profile.bank_name ?? '',
      account_number_last_four: profile.account_number_last_four ?? '',
      ifsc_code: profile.ifsc_code ?? '',
      dbt_enabled: profile.dbt_enabled ?? false,

      pm_kisan_id: profile.pm_kisan_id ?? '',
      kcc_holder: profile.kcc_holder ?? false,
      kcc_limit: profile.kcc_limit ?? null,
      pmfby_policy_number: profile.pmfby_policy_number ?? '',
      ration_card_number: profile.ration_card_number ?? '',
      soil_health_card_number: profile.soil_health_card_number ?? '',

      farming_type: profile.farming_type ?? null,
      total_land_acres: profile.total_land_acres ?? null,
      primary_irrigation_source: profile.primary_irrigation_source ?? '',
      machinery_owned: profile.machinery_owned?.join(', ') ?? '',
      livestock_owned: profile.livestock_owned?.join(', ') ?? '',
      storage_facility: profile.storage_facility ?? null,
    }),
    [profile]
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  })

  const values = useWatch({ control })
  const completeness = profileCompleteness({ ...initialValues, ...values })

  const saveMutation = useMutation({
    mutationFn: async (formValues: ProfileFormValues) => {
      const supabase = createClient()
      const primaryCropsList = formValues.primary_crops
        .split(',')
        .map((crop) => crop.trim())
        .filter(Boolean)
      const machineryList = formValues.machinery_owned
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
      const livestockList = formValues.livestock_owned
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)

      const payload: Record<string, any> = {
        full_name: formValues.full_name || null,
        phone: formValues.phone || null,
        preferred_language: formValues.preferred_language,
        village: formValues.village || null,
        taluka: formValues.taluka || null,
        district: formValues.district || null,
        state: formValues.state,
        farmer_type: formValues.farmer_type,
        years_farming: formValues.years_farming,
        primary_crops: primaryCropsList,
        voice_first: formValues.voice_first,
        low_literacy_mode: formValues.low_literacy_mode,
        profile_completed: completeness >= 80,
      }

      // Extended government & farming fields
      const extendedPayload: Record<string, any> = {
        ...payload,
        pincode: formValues.pincode || null,
        farmer_id: formValues.farmer_id || null,
        aadhaar_last_four: formValues.aadhaar_last_four || null,
        gender: formValues.gender,
        date_of_birth: formValues.date_of_birth || null,
        social_category: formValues.social_category,
        bank_name: formValues.bank_name || null,
        account_number_last_four: formValues.account_number_last_four || null,
        ifsc_code: formValues.ifsc_code || null,
        dbt_enabled: formValues.dbt_enabled,
        pm_kisan_id: formValues.pm_kisan_id || null,
        kcc_holder: formValues.kcc_holder,
        kcc_limit: formValues.kcc_limit,
        pmfby_policy_number: formValues.pmfby_policy_number || null,
        ration_card_number: formValues.ration_card_number || null,
        soil_health_card_number: formValues.soil_health_card_number || null,
        farming_type: formValues.farming_type,
        total_land_acres: formValues.total_land_acres,
        primary_irrigation_source: formValues.primary_irrigation_source || null,
        machinery_owned: machineryList,
        livestock_owned: livestockList,
        storage_facility: formValues.storage_facility,
      }

      const { error } = await supabase.from('profiles').update(extendedPayload).eq('id', profile.id)

      if (error) {
        // If migration 0005 has not been executed in Supabase yet, fallback gracefully to core fields
        const isColumnMissing =
          error.message?.includes('column') ||
          error.message?.includes('does not exist') ||
          error.code === '42703'

        if (isColumnMissing) {
          const { error: coreError } = await supabase.from('profiles').update(payload).eq('id', profile.id)
          if (coreError) throw coreError
          return { language: formValues.preferred_language, migrationPending: true }
        }
        throw error
      }

      return { language: formValues.preferred_language, migrationPending: false }
    },
    onSuccess: ({ language, migrationPending }) => {
      analytics.trackEvent('profile_saved')
      if (migrationPending) {
        setMessage({
          type: 'warning',
          text: `${t('saved')} (Note: Run migration 0005 in Supabase to persist extended government fields).`,
        })
      } else {
        setMessage({ type: 'success', text: t('saved') })
      }
      if (language !== locale) {
        analytics.trackEvent('language_changed', { from: locale, to: language })
        router.replace('/profile', { locale: language })
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
      {/* Profile Completeness Hero */}
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">{t('completeness')}</h2>
            <p className="text-xs font-medium text-text-secondary mt-0.5">
              {completeness >= 80 ? 'Verified ready for government schemes' : 'Complete fields to check scheme eligibility'}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-primary-dark tabular-nums">{completeness}%</span>
        </div>
        <div className="mt-3.5 h-3 overflow-hidden rounded-full bg-primary-surface">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal & Identity */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <User className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-bold text-text-primary">{t('personal')}</h3>
            </div>
            <ProvenanceBadge value="farmerEntered" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fullName')} name="full_name" register={register} />
            <Field label={t('phone')} name="phone" register={register} type="tel" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-xs font-bold text-text-primary">
                {t('gender')}
              </label>
              <select
                id="gender"
                {...register('gender')}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
              >
                <option value="">{t('notSet')}</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {t(g)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t('dob')} name="date_of_birth" register={register} type="date" />
            <div className="space-y-1.5">
              <label htmlFor="social_category" className="text-xs font-bold text-text-primary">
                {t('socialCategory')}
              </label>
              <select
                id="social_category"
                {...register('social_category')}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
              >
                <option value="">{t('notSet')}</option>
                {socialCategories.map((c) => (
                  <option key={c} value={c}>
                    {t(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Government Registry & Aadhaar (Privacy First) */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-bold text-text-primary">{t('govIdentity')}</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-surface px-2.5 py-0.5 text-[11px] font-bold text-primary-dark">
              Encrypted
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('farmerId')}
              name="farmer_id"
              register={register}
              hint={t('farmerIdHint')}
              placeholder="e.g. MH-1234-5678-9012"
            />
            <Field
              label={t('aadhaarLastFour')}
              name="aadhaar_last_four"
              register={register}
              hint={t('aadhaarHint')}
              maxLength={4}
              placeholder="e.g. 5432"
            />
          </div>
        </section>

        {/* Section 3: Residential & Village Location */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">Location & Address</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('village')} name="village" register={register} />
            <Field label={t('taluka')} name="taluka" register={register} />
            <Field label={t('district')} name="district" register={register} />
            <Field label={t('state')} name="state" register={register} error={errors.state?.message} />
          </div>
          <div className="sm:w-1/2">
            <Field label={t('pincode')} name="pincode" register={register} maxLength={6} placeholder="e.g. 411001" />
          </div>
        </section>

        {/* Section 4: Banking & Direct Benefit Transfer (DBT) */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">{t('bankingDbt')}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('bankName')} name="bank_name" register={register} placeholder="e.g. State Bank of India" />
            <Field
              label={t('accountNumberLastFour')}
              name="account_number_last_four"
              register={register}
              maxLength={4}
              placeholder="Last 4 digits"
            />
            <Field label={t('ifscCode')} name="ifsc_code" register={register} placeholder="e.g. SBIN0001234" />
          </div>

          <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-semibold text-text-primary cursor-pointer">
            <input type="checkbox" {...register('dbt_enabled')} className="h-5 w-5 rounded-md accent-primary" />
            <span>{t('dbtEnabled')}</span>
          </label>
        </section>

        {/* Section 5: Government Schemes & Registry */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Award className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">{t('schemesSection')}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('pmKisanId')}
              name="pm_kisan_id"
              register={register}
              placeholder="e.g. PMK-MH-1234567"
            />
            <Field
              label={t('pmfbyPolicy')}
              name="pmfby_policy_number"
              register={register}
              placeholder="e.g. 0401062300..."
            />
            <Field
              label={t('rationCard')}
              name="ration_card_number"
              register={register}
              placeholder="Ration card or Family ID"
            />
            <Field
              label={t('soilHealthCard')}
              name="soil_health_card_number"
              register={register}
              placeholder="SHC Number"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-semibold text-text-primary cursor-pointer">
              <input type="checkbox" {...register('kcc_holder')} className="h-5 w-5 rounded-md accent-primary" />
              <span>{t('kccHolder')}</span>
            </label>
            <Field
              label={t('kccLimit')}
              name="kcc_limit"
              type="number"
              register={register}
              placeholder="Sanctioned credit limit ₹"
            />
          </div>
        </section>

        {/* Section 6: Comprehensive Agricultural Operations */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Sprout className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">{t('farmingOps')}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="farmer_type" className="text-xs font-bold text-text-primary">
                {t('farmerType')}
              </label>
              <select
                id="farmer_type"
                {...register('farmer_type')}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
              >
                <option value="">{t('notSet')}</option>
                {farmerTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="farming_type" className="text-xs font-bold text-text-primary">
                {t('farmingType')}
              </label>
              <select
                id="farming_type"
                {...register('farming_type')}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
              >
                <option value="">{t('notSet')}</option>
                {farmingTypes.map((ft) => (
                  <option key={ft} value={ft}>
                    {t(ft)}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label={t('totalLandAcres')}
              name="total_land_acres"
              type="number"
              register={register}
              placeholder="e.g. 4.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="years_farming" className="text-xs font-bold text-text-primary">
                {t('yearsFarming')}
              </label>
              <input
                id="years_farming"
                type="number"
                min="0"
                {...register('years_farming', {
                  valueAsNumber: true,
                  setValueAs: (v) => (Number.isNaN(v) ? null : v),
                })}
                className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
              />
            </div>
            <Field
              label={t('primaryIrrigation')}
              name="primary_irrigation_source"
              register={register}
              placeholder="e.g. Drip Irrigation, Open Well, Canal"
            />
          </div>

          <Field
            label={t('primaryCrops')}
            name="primary_crops"
            register={register}
            hint={t('primaryCropsHint')}
            placeholder="e.g. Cotton, Soybean, Onion, Wheat"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('machineryOwned')}
              name="machinery_owned"
              register={register}
              placeholder="e.g. Tractor 45HP, Battery Sprayer"
            />
            <Field
              label={t('livestockOwned')}
              name="livestock_owned"
              register={register}
              placeholder="e.g. 2 Cows, 4 Goats"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="storage_facility" className="text-xs font-bold text-text-primary">
              {t('storageFacility')}
            </label>
            <select
              id="storage_facility"
              {...register('storage_facility')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="">{t('notSet')}</option>
              {storageFacilities.map((sf) => (
                <option key={sf} value={sf}>
                  {t(sf)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Section 7: Accessibility & App Preferences */}
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h3 className="text-base font-bold text-text-primary border-b border-border/60 pb-3">
            Preferences & Language
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="preferred_language" className="text-xs font-bold text-text-primary">
              {t('preferredLanguage')}
            </label>
            <select
              id="preferred_language"
              {...register('preferred_language')}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="en">{t('english')}</option>
              <option value="mr">{t('marathi')}</option>
              <option value="hi">{t('hindi')}</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-semibold text-text-primary cursor-pointer">
              <input type="checkbox" {...register('voice_first')} className="h-5 w-5 rounded-md accent-primary" />
              <span>{t('voiceFirst')}</span>
            </label>
            <label className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-semibold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                {...register('low_literacy_mode')}
                className="h-5 w-5 rounded-md accent-primary"
              />
              <span>{t('lowLiteracyMode')}</span>
            </label>
          </div>
        </section>

        {message && (
          <p
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`rounded-2xl p-4 text-sm font-semibold ${
              message.type === 'error'
                ? 'bg-red-50 text-status-alert border border-red-200'
                : message.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-primary-surface text-primary-dark border border-primary-light/40'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60"
        >
          {saveMutation.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          <span>{t('save')}</span>
        </button>
      </form>

      <button
        type="button"
        onClick={signOut}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 text-sm font-bold text-status-alert shadow-xs transition-colors duration-200 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        <span>{t('signOut')}</span>
      </button>
    </div>
  )
}

function Field({
  label,
  name,
  register,
  type = 'text',
  hint,
  error,
  placeholder,
  maxLength,
}: {
  label: string
  name: keyof ProfileFormValues
  register: ReturnType<typeof useForm<ProfileFormValues>>['register']
  type?: string
  hint?: string
  error?: string
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-xs font-bold text-text-primary">
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        {...register(name, {
          setValueAs: (v) => (type === 'number' && (v === '' || Number.isNaN(Number(v))) ? null : type === 'number' ? Number(v) : v),
        })}
        className="min-h-[48px] w-full rounded-2xl border border-border bg-background px-3.5 text-sm font-medium text-text-primary outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="text-[11px] font-medium text-text-secondary">{hint}</p>}
      {error && <p className="text-xs font-semibold text-status-alert">{error}</p>}
    </div>
  )
}
