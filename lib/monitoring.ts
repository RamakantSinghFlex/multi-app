// Simple monitoring and logging utility

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private enabled = true

  constructor() {
    // Initialize with environment-specific settings
    this.enabled = process.env.NODE_ENV !== "production" || !!process.env.NEXT_PUBLIC_ENABLE_LOGGING
  }

  public debug(message: string, data?: any): void {
    this.log("debug", message, data)
  }

  public info(message: string, data?: any): void {
    this.log("info", message, data)
  }

  public warn(message: string, data?: any): void {
    this.log("warn", message, data)
  }

  public error(message: string, data?: any): void {
    this.log("error", message, data)
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.enabled) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    // Add to in-memory logs
    this.logs.push(entry)

    // Trim logs if they exceed the maximum
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      const consoleMethod = level === "debug" ? "log" : level
      console[consoleMethod as keyof Console](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data || "")
    }

    // In a real app, you might send critical logs to a service like Sentry
    if (level === "error") {
      this.reportError(message, data)
    }
  }

  private reportError(message: string, data?: any): void {
    // In a real app, you would send this to an error reporting service
    // Example: Sentry.captureException(new Error(message), { extra: data });
    console.error("[REPORT]", message, data)
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  public clearLogs(): void {
    this.logs = []
  }

  // Performance monitoring
  public startTimer(label: string): () => void {
    if (!this.enabled) return () => {}

    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.info(`Timer [${label}] completed in ${duration.toFixed(2)}ms`)
    }
  }
}

// Create a singleton instance
export const logger = new Logger()

// Performance monitoring utility
export function measurePerformance<T>(fn: () => T, label: string): T {
  const endTimer = logger.startTimer(label)
  try {
    const result = fn()

    // Handle promises
    if (result instanceof Promise) {
      return result.finally(endTimer) as T
    }

    endTimer()
    return result
  } catch (error) {
    logger.error(`Error in ${label}`, error)
    endTimer()
    throw error
  }
}

