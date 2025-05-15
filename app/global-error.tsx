/**
 * Global error boundaries must be Client Components
 * This file must use 'use client' directive as per Next.js documentation
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
    setMounted(true)
  }, [error])

  if (!mounted) {
    return null
  }

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Card className="mx-auto max-w-md border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Critical Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                We&apos;re sorry, but a critical error has occurred in the
                application.
              </p>
              {error.digest && (
                <p className="mb-4 text-sm text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
              <div className="mt-6">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => reset()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Application
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please contact our support team.
              </p>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
