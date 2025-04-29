"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { logger } from "@/lib/monitoring"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    try {
      logger.error("Error caught by ErrorBoundary:", { error, errorInfo })
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
      console.error("Original error:", error)
      console.error("Error info:", errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise render a default error message
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-red-700">Something went wrong</h2>
            <p className="mb-4 text-red-600">The application encountered an error. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
