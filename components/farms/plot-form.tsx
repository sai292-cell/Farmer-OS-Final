'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { analytics } from '@/lib/analytics'

export function PlotForm({ farmId, plot, onSaved }: { farmId: string; plot?: { id: string; name: string; notes: string | null }; onSaved?: () => void }) {
  const t = useTranslations('farms')
  const [name, setName] = useState(plot?.name || '')
  const [notes, setNotes] = useState(plot?.notes || '')
  const [error, setError] = useState('')
  const save = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !name.trim()) { setError(t('plotNameRequired')); return }
    const result = plot ? await supabase.from('plots').update({ name: name.trim(), notes }).eq('id', plot.id) : await supabase.from('plots').insert({ farm_id: farmId, owner_id: user.id, name: name.trim(), notes })
    if (result.error) setError(result.error.message)
    else { if (!plot) analytics.trackEvent('plot_created'); onSaved?.(); setName(''); setNotes('') }
  }
  return <div className="space-y-2 rounded-2xl border border-border p-4"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('plotName')} className="min-h-[48px] w-full rounded-xl border border-border px-3" /><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t('notes')} rows={2} className="w-full rounded-xl border border-border p-3" /><Button type="button" className="min-h-[48px] rounded-2xl" onClick={save}>{t('savePlot')}</Button>{error && <p className="text-sm text-destructive">{error}</p>}</div>
}
