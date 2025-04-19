/**
 * Error Boundary Component
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */

"use client"

import type React from "react"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { logger, reportError } from "@/lib/monitoring"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  /**
   * Update state when an error occurs
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  /**
   * Log error information
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error caught by ErrorBoundary:", { error, errorInfo })
    reportError(error, { componentStack: errorInfo.componentStack })
  }

  /**
   * Reset error state and retry
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Render error UI or children
   */
  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="max-h-[200px] overflow-auto rounded bg-destructive/10 p-2 text-sm">
                    {this.state.error?.toString() || "Unknown error"}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload page
              </Button>
              <Button onClick={this.handleReset} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrap a component with an error boundary
 * @param Component Component to wrap
 * @param fallback Optional fallback UI
 * @returns Wrapped component
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
}

// Export the ErrorBoundary as the default export
export default ErrorBoundary
