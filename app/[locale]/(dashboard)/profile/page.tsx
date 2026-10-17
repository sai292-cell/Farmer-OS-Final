import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'
import { PageContainer } from '@/components/shared/page-container'
import type { Profile } from '@/lib/profile'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const t = await getTranslations('pages')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) {
    return (
      <PageContainer narrow>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-status-alert">
          {t('profileUnavailable')}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer narrow className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        {t('profileTitle')}
      </h1>
      <ProfileForm profile={profile as Profile} />
    </PageContainer>
  )
}
