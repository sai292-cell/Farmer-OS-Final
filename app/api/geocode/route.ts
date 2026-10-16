import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const querySchema = z.string().trim().min(3).max(120)
const requests = new Map<string, number[]>()

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get('q') || '')
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 })
  const now = Date.now()
  const recent = (requests.get(user.id) || []).filter((time) => now - time < 60_000)
  if (recent.length >= 30 || (recent.length && now - recent[recent.length - 1] < 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  requests.set(user.id, [...recent, now])
  const params = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', namedetails: '1', dedupe: '1', limit: '10', countrycodes: process.env.GEOCODER_COUNTRY_CODES || 'in', q: parsed.data })
  const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
  params.set('accept-language', locale)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org/search'}?${params}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': process.env.GEOCODER_USER_AGENT || 'FarmerOS/1.0 (map search)',
        Referer: process.env.GEOCODER_REFERER || 'http://localhost:3000',
      },
      cache: 'no-store',
    })
    if (!response.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 })
    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
