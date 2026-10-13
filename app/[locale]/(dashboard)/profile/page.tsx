import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'
import type { Profile } from '@/lib/profile'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const t = await getTranslations('pages')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) return <div className="mx-auto max-w-3xl px-4 py-8 text-status-alert">{t('profileUnavailable')}</div>
  return <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6"><h1 className="text-3xl font-bold text-text-primary">{t('profileTitle')}</h1><ProfileForm profile={profile as Profile} /></div>
}
