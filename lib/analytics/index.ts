import { AnalyticsService } from './types'

class ConsoleAnalyticsService implements AnalyticsService {
  private isDev = process.env.NODE_ENV !== 'production'

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (this.isDev) {
      console.log(`[FarmerOS Analytics Event] ${eventName}`, {
        ...properties,
        timestamp: new Date().toISOString(),
      })
    }
  }

  trackPageView(url: string, properties?: Record<string, unknown>): void {
    if (this.isDev) {
      console.log(`[FarmerOS Analytics PageView] ${url}`, {
        ...properties,
        timestamp: new Date().toISOString(),
      })
    }
  }
}

export const analytics: AnalyticsService = new ConsoleAnalyticsService()
export * from './types'
