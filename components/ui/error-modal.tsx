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

export interface ValidationError {
  message: string
  path?: string
}

export interface ErrorData {
  collection?: string
  errors?: ValidationError[]
}

export interface ApiError {
  name?: string
  message: string
  data?: ErrorData
}

interface ErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errors?: ApiError[] | null
  title?: string
  description?: string
}

export function ErrorModal({
  open,
  onOpenChange,
  errors,
  title = "Error",
  description = "There was an error processing your request.",
}: ErrorModalProps) {
  const [allValidationErrors, setAllValidationErrors] = useState<ValidationError[]>([])

  useEffect(() => {
    if (errors && errors.length > 0) {
      // Extract all validation errors from the error structure
      const validationErrors: ValidationError[] = []

      errors.forEach((error) => {
        if (error.data?.errors && error.data.errors.length > 0) {
          validationErrors.push(...error.data.errors)
        } else if (error.message) {
          validationErrors.push({ message: error.message })
        }
      })

      setAllValidationErrors(validationErrors)
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
      return [{ message: error.message }]
    }

    // If it's a response with a message
    if (error.message) {
      return [{ message: error.message }]
    }

    // Default fallback
    return [{ message: "An unexpected error occurred" }]
  } catch (e) {
    return [{ message: "An unexpected error occurred" }]
  }
}
