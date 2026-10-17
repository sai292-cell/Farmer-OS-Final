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
  if (recent.length >= 60 || (recent.length && now - recent[recent.length - 1] < 200)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }
  requests.set(user.id, [...recent, now])

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    // 1. Try Esri World Geocoding Service if API key is configured
    const esriKey = process.env.NEXT_PUBLIC_ESRI_API_KEY || process.env.ESRI_API_KEY
    if (esriKey) {
      try {
        const esriParams = new URLSearchParams({
          singleLine: parsed.data,
          countryCode: process.env.GEOCODER_COUNTRY_CODES || 'IND',
          maxLocations: '8',
          outFields: 'Addr_type,Type,Place_addr,PlaceName',
          f: 'json',
          token: esriKey,
          forStorage: 'false',
        })

        const esriRes = await fetch(
          `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${esriParams.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Referer: process.env.GEOCODER_REFERER || 'http://localhost:3000',
            },
          },
        )

        if (esriRes.ok) {
          const esriData = await esriRes.json()
          const candidates = esriData.candidates || []
          if (candidates.length > 0) {
            const formatted = candidates.map(
              (c: {
                address: string
                location: { x: number; y: number }
                attributes?: { Type?: string; Addr_type?: string }
              }) => ({
                display_name: c.address,
                type: c.attributes?.Type || c.attributes?.Addr_type || 'village',
                lat: String(c.location.y),
                lon: String(c.location.x),
              }),
            )
            return NextResponse.json(formatted)
          }
        }
      } catch {
        // Fall back to Nominatim on network or parsing error
      }
    }

    // 2. OpenStreetMap / Nominatim fallback
    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      namedetails: '1',
      dedupe: '1',
      limit: '10',
      countrycodes: process.env.GEOCODER_COUNTRY_CODES || 'in',
      q: parsed.data,
    })
    const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
    params.set('accept-language', locale)

    const response = await fetch(
      `${process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org/search'}?${params}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': process.env.GEOCODER_USER_AGENT || 'FarmerOS/1.0 (map search)',
          Referer: process.env.GEOCODER_REFERER || 'http://localhost:3000',
        },
        cache: 'no-store',
      },
    )
    if (!response.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 })
    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 504 })
  } finally {
    clearTimeout(timeout)
  }
}
