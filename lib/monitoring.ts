import { ENABLE_LOGGING } from "./config"

// Simple logger for client-side logging
class Logger {
  private enabled: boolean

  constructor(enabled = true) {
    this.enabled = enabled && ENABLE_LOGGING
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return
    if (data) {
      console.info(`[INFO] ${message}`, data)
    } else {
      console.info(`[INFO] ${message}`)
    }
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return
    if (data) {
      console.warn(`[WARN] ${message}`, data)
    } else {
      console.warn(`[WARN] ${message}`)
    }
  }

  error(message: string, error?: any): void {
    if (!this.enabled) return
    if (error) {
      console.error(`[ERROR] ${message}`, error)
    } else {
      console.error(`[ERROR] ${message}`)
    }
  }

  debug(message: string, data?: any): void {
    if (!this.enabled) return
    if (data) {
      console.debug(`[DEBUG] ${message}`, data)
    } else {
      console.debug(`[DEBUG] ${message}`)
    }
  }

  // Track page views
  pageView(path: string): void {
    if (!this.enabled) return
    this.info(`Page view: ${path}`)
    // In a real app, you would send this to an analytics service
  }

  // Track events
  event(category: string, action: string, label?: string, value?: number): void {
    if (!this.enabled) return
    this.info(`Event: ${category} - ${action}${label ? ` - ${label}` : ""}${value !== undefined ? ` - ${value}` : ""}`)
    // In a real app, you would send this to an analytics service
  }
}

// Export a singleton instance
export const logger = new Logger()

// Error reporting
export function reportError(error: Error, context?: any): void {
  if (!ENABLE_LOGGING) return

  logger.error("Error reported", { error, context })
  // In a real app, you would send this to an error reporting service like Sentry
}

// Performance monitoring
export function trackPerformance(name: string, callback: () => void): void {
  if (!ENABLE_LOGGING) {
    callback()
    return
  }

  const start = performance.now()
  callback()
  const end = performance.now()
  logger.debug(`Performance: ${name} took ${end - start}ms`)
}
