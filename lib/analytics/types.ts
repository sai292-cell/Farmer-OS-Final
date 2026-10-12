export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: string
}

export interface AnalyticsService {
  trackEvent(eventName: string, properties?: Record<string, unknown>): void
  trackPageView(url: string, properties?: Record<string, unknown>): void
}
