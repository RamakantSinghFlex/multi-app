"use client"

import { useAuth } from "@/lib/simple-auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LoginButton() {
  const { loginWithGoogle, isLoading, isAuthenticated } = useAuth()

  const handleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Sign in with Google"
      )}
    </Button>
  )
}
