/**
 * Error Modal Component
 *
 * This component displays errors in a modal dialog.
 * It supports displaying multiple validation errors and provides a consistent UI for error handling.
 */

"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/monitoring"

/**
 * Validation error structure
 */
export interface ValidationError {
  message: string
  path?: string
}

/**
 * Error data structure
 */
export interface ErrorData {
  collection?: string
  errors?: ValidationError[]
}

/**
 * API error structure
 */
export interface ApiError {
  name?: string
  message: string
  data?: ErrorData
  status?: number
  code?: string
}

/**
 * Error modal props
 */
interface ErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errors?: ApiError[] | null
  title?: string
  description?: string
  onRetry?: () => void
  showRetry?: boolean
}

/**
 * Error Modal Component
 */
export function ErrorModal({
  open,
  onOpenChange,
  errors,
  title = "Error",
  description = "There was an error processing your request.",
  onRetry,
  showRetry = false,
}: ErrorModalProps) {
  const [allValidationErrors, setAllValidationErrors] = useState<ValidationError[]>([])

  // Extract validation errors from the error structure
  useEffect(() => {
    if (errors && errors.length > 0) {
      const validationErrors: ValidationError[] = []

      errors.forEach((error) => {
        if (error.data?.errors && error.data.errors.length > 0) {
          validationErrors.push(...error.data.errors)
        } else if (error.message) {
          validationErrors.push({ message: error.message })
        }
      })

      setAllValidationErrors(validationErrors)

      // Log errors for debugging
      logger.error("API errors:", { errors })
    } else {
      setAllValidationErrors([])
    }
  }, [errors])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-4">
          {allValidationErrors.length > 0 ? (
            <div className="space-y-3">
              {allValidationErrors.map((error, index) => (
                <Alert key={index} variant="destructive" className="flex items-start">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div className="ml-2 flex-1">
                    <AlertDescription>
                      {error.path ? (
                        <span>
                          <strong className="capitalize">{error.path}</strong>: {error.message}
                        </span>
                      ) : (
                        error.message
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>An unexpected error occurred. Please try again or contact support.</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {showRetry && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Retry
            </Button>
          )}
          <Button
            variant={showRetry && onRetry ? "default" : "outline"}
            onClick={() => onOpenChange(false)}
            className={showRetry && onRetry ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Parse API error into a standardized format
 * @param error Error object or string
 * @returns Array of standardized API errors
 */
export function parseApiError(error: any): ApiError[] {
  try {
    // If it's already in the expected format
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors
    }

    // If it's a string
    if (typeof error === "string") {
      return [{ message: error }]
    }

    // If it's an Error object
    if (error instanceof Error) {
      return [{ message: error.message, name: error.name }]
    }

    // If it's a response with a message
    if (error.message) {
      return [
        {
          message: error.message,
          name: error.name,
          status: error.status,
          code: error.code,
        },
      ]
    }

    // If it's a response with data.errors
    if (error.data && error.data.errors) {
      return [
        {
          message: "Validation errors occurred",
          data: error.data,
        },
      ]
    }

    // Default fallback
    return [{ message: "An unexpected error occurred" }]
  } catch (e) {
    logger.error("Error parsing API error:", e)
    return [{ message: "An unexpected error occurred" }]
  }
}

/**
 * Format error message for display
 * @param error Error object or string
 * @returns Formatted error message
 */
export function formatErrorMessage(error: any): string {
  try {
    if (typeof error === "string") return error
    if (error.message) return error.message
    if (error.error) return typeof error.error === "string" ? error.error : JSON.stringify(error.error)
    return "An unexpected error occurred"
  } catch (e) {
    return "An unexpected error occurred"
  }
}
