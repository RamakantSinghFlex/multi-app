"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  const handleTryAgain = () => {
    router.push("/appointments/new")
  }

  const handleGoToDashboard = () => {
    router.push("/")
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">Your payment was cancelled and no charges were made</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <XCircle className="h-16 w-16 text-amber-500" />
          <p className="mt-4 text-center">
            You&apos;ve cancelled the payment process. Your appointment has not been booked and no charges have been
            made to your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleTryAgain} className="w-full">
            Try Again
          </Button>
          <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
