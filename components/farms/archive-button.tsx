'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function ArchiveButton({ table, id }: { table: 'farms' | 'plots'; id: string }) {
  const t = useTranslations('farms')
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const archive = async () => {
    if (!window.confirm(t('archiveConfirm'))) return
    setBusy(true)
    const { error } = await createClient().from(table).update({ archived_at: new Date().toISOString() }).eq('id', id)
    setBusy(false)
    if (!error) router.refresh()
  }
  return <Button type="button" variant="outline" className="min-h-[48px] rounded-2xl text-destructive" onClick={archive} disabled={busy}>{t('archive')}</Button>
}
