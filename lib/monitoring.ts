/**
 * Monitoring and Logging Utilities
 *
 * This module provides logging and monitoring functionality for the application.
 * It includes:
 * - Structured logging with different severity levels
 * - Error reporting
 * - Performance tracking
 */

import { ENABLE_LOGGING } from "./config"

// Define log levels for better filtering
export enum LogLevel {
  // eslint-disable-next-line no-unused-vars
  DEBUG = "DEBUG",
  // eslint-disable-next-line no-unused-vars
  INFO = "INFO",
  // eslint-disable-next-line no-unused-vars
  WARN = "WARN",
  ERROR = "ERROR"
}

// Interface for structured log entries
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

/**
 * Logger class for client-side logging with structured output
 */
export class Logger {
  private enabled: boolean
  private logBuffer: LogEntry[] = []
  private readonly MAX_BUFFER_SIZE = 100

  constructor(enabled = true) {
    this.enabled = enabled && ENABLE_LOGGING
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (data !== undefined) {
      entry.data = this.sanitizeData(data)
    }

    return entry
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: any): any {
    if (!data) return data

    // Clone the data to avoid modifying the original
    let sanitized: any

    try {
      sanitized = JSON.parse(JSON.stringify(data))
    } catch (e) {
      // If data can't be stringified, return a simple representation
      return `[Unstringifiable data: ${typeof data}]`
    }

    // Mask sensitive fields
    const sensitiveFields = ["password", "token", "secret", "apiKey", "api_key", "key"]

    const maskObject = (obj: any) => {
      if (!obj || typeof obj !== "object") return

      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          obj[key] = "[REDACTED]"
        } else if (typeof obj[key] === "object") {
          maskObject(obj[key])
        }
      })
    }

    maskObject(sanitized)
    return sanitized
  }

  /**
   * Log an informational message
   */
  info(message: string, data?: any): void {
    if (!this.enabled) return

    const entry = this.createLogEntry(LogLevel.INFO, message, data)
    this.logBuffer.push(entry)
    this.trimBuffer()

    if (data) {
      console.info(`[${entry.timestamp}] [INFO] ${message}`, entry.data)
    } else {
      console.info(`[${entry.timestamp}] [INFO] ${message}`)
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    if (!this.enabled) return

    const entry = this.createLogEntry(LogLevel.WARN, message, data)
    this.logBuffer.push(entry)
    this.trimBuffer()

    if (data) {
      console.warn(`[${entry.timestamp}] [WARN] ${message}`, entry.data)
    } else {
      console.warn(`[${entry.timestamp}] [WARN] ${message}`)
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: any): void {
    if (!this.enabled) return

    const entry = this.createLogEntry(LogLevel.ERROR, message, error)
    this.logBuffer.push(entry)
    this.trimBuffer()

    if (error) {
      console.error(`[${entry.timestamp}] [ERROR] ${message}`, entry.data)
    } else {
      console.error(`[${entry.timestamp}] [ERROR] ${message}`)
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    if (!this.enabled) return

    const entry = this.createLogEntry(LogLevel.DEBUG, message, data)
    this.logBuffer.push(entry)
    this.trimBuffer()

    if (data) {
      console.debug(`[${entry.timestamp}] [DEBUG] ${message}`, entry.data)
    } else {
      console.debug(`[${entry.timestamp}] [DEBUG] ${message}`)
    }
  }

  /**
   * Keep the log buffer from growing too large
   */
  private trimBuffer(): void {
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer = this.logBuffer.slice(-this.MAX_BUFFER_SIZE)
    }
  }

  /**
   * Get recent logs for debugging
   */
  getLogs(level?: LogLevel, limit = 50): LogEntry[] {
    if (level) {
      return this.logBuffer.filter((entry) => entry.level === level).slice(-limit)
    }
    return this.logBuffer.slice(-limit)
  }

  /**
   * Track page views
   */
  pageView(path: string): void {
    if (!this.enabled) return
    this.info(`Page view: ${path}`)
    // In a production app, you would send this to an analytics service
  }

  /**
   * Track events
   */
  event(category: string, action: string, label?: string, value?: number): void {
    if (!this.enabled) return
    this.info(`Event: ${category} - ${action}${label ? ` - ${label}` : ""}${value !== undefined ? ` - ${value}` : ""}`)
    // In a production app, you would send this to an analytics service
  }
}

// Simple logger implementation that doesn't rely on external dependencies
export const logger = {
  info: (message: string, data?: any) => {
    if (typeof window !== "undefined" && window.console) {
      console.info(`[INFO] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    if (typeof window !== "undefined" && window.console) {
      console.warn(`[WARN] ${message}`, data || "")
    }
  },
  error: (message: string, error?: any) => {
    if (typeof window !== "undefined" && window.console) {
      console.error(`[ERROR] ${message}`, error || "")
    }
  },
}

/**
 * Report errors to monitoring service
 * @param error Error object
 * @param context Additional context for the error
 */
export function reportError(error: Error, context?: any): void {
  if (!ENABLE_LOGGING) return

  logger.error("Error reported", { error, context })

  // In a production app, you would send this to an error reporting service like Sentry
  // Example Sentry integration:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Track performance of operations
 * @param name Operation name
 * @param callback Function to execute and measure
 */
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

/**
 * Measure async function execution time
 * @param name Operation name
 * @param asyncFn Async function to measure
 * @returns Result of the async function
 */
export async function trackAsyncPerformance<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
  if (!ENABLE_LOGGING) {
    return await asyncFn()
  }

  const start = performance.now()
  try {
    const result = await asyncFn()
    const end = performance.now()
    logger.debug(`Performance: ${name} took ${end - start}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    logger.error(`Performance: ${name} failed after ${end - start}ms`, error)
    throw error
  }
}
