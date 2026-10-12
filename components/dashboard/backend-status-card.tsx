'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, RefreshCw, Database, Activity, Clock, ShieldCheck } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface HealthCheckResult {
  connected: boolean
  statusCode: number | null
  latencyMs: number
  endpoint: string
  checkedAt: string
  error?: string
}

async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const startTime = performance.now()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  try {
    // 1. Check with Supabase JS client
    const supabase = createClient()
    const sessionPromise = supabase.auth.getSession()

    // 2. Direct health ping to Supabase GoTrue endpoint
    const pingPromise = fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
      },
    })

    const [sessionRes, pingRes] = await Promise.all([sessionPromise, pingPromise])
    const latencyMs = Math.round(performance.now() - startTime)

    if (sessionRes.error) {
      throw new Error(sessionRes.error.message)
    }

    const isOk = pingRes.ok || pingRes.status === 200

    return {
      connected: isOk,
      statusCode: pingRes.status,
      latencyMs,
      endpoint: supabaseUrl,
      checkedAt: new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime)
    const message = err instanceof Error ? err.message : 'Unknown connection failure'

    return {
      connected: false,
      statusCode: null,
      latencyMs,
      endpoint: supabaseUrl,
      checkedAt: new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      error: message,
    }
  }
}

export function BackendStatusCard() {
  const t = useTranslations('backend')

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['supabase-health'],
    queryFn: async () => {
      analytics.trackEvent('backend_health_check_initiated')
      const result = await checkSupabaseHealth()
      analytics.trackEvent('backend_health_check_completed', {
        connected: result.connected,
        latencyMs: result.latencyMs,
      })
      return result
    },
  })

  const isConnected = data?.connected === true
  const isPending = isLoading || isFetching

  return (
    <Card className="w-full border-border bg-surface shadow-md rounded-3xl overflow-hidden transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-surface to-background pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-primary">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Live PostgREST & Auth Health
              </CardDescription>
            </div>
          </div>

          {/* Status Badge */}
          {isPending ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-primary font-medium text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{t('checking')}</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-status-verified/15 text-status-verified font-bold text-sm border border-status-verified/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('connected')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-status-alert/15 text-status-alert font-bold text-sm border border-status-alert/30">
              <XCircle className="w-4 h-4" />
              <span>{t('notReachable')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-text-secondary font-medium block">
                {t('responseStatus')}
              </span>
              <span className="text-lg font-bold text-text-primary">
                {isPending ? '...' : data?.statusCode ? `${data.statusCode} OK` : 'N/A'}
              </span>
            </div>
            <Activity className="w-5 h-5 text-text-secondary" />
          </div>

          <div className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-text-secondary font-medium block">
                Latency
              </span>
              <span className="text-lg font-bold text-text-primary">
                {isPending ? '...' : `${data?.latencyMs || 0} ms`}
              </span>
            </div>
            <div className="text-xs px-2 py-0.5 rounded-md bg-primary-surface text-primary-dark font-semibold">
              Live
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-text-secondary font-medium block">
                {t('checkedAt')}
              </span>
              <span className="text-sm font-bold text-text-primary">
                {isPending ? '...' : data?.checkedAt || '—'}
              </span>
            </div>
            <Clock className="w-5 h-5 text-text-secondary" />
          </div>
        </div>

        {/* Endpoint info */}
        <div className="p-3 rounded-2xl bg-background/80 border border-border/70 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <span className="text-text-secondary font-medium">{t('endpoint')}:</span>
          <span className="font-mono text-text-primary break-all">
            {data?.endpoint || 'https://mydajbewnqucnupfgzzy.supabase.co'}
          </span>
        </div>

        {/* Error message if connection failed */}
        {!isConnected && !isPending && data?.error && (
          <div className="p-3 rounded-2xl bg-status-alert/10 border border-status-alert/30 text-status-alert text-xs">
            <strong>Error details:</strong> {data.error}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-6 px-6 flex justify-end border-t border-border/40">
        <Button
          type="button"
          onClick={() => refetch()}
          disabled={isPending}
          className="min-h-[48px] px-6 text-sm font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary-dark cursor-pointer transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          <span>{t('refresh')}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
