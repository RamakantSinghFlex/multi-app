"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface PasswordDisplayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: Array<{
    email: string
    userType: string
    name?: string
  }>
  currentUserRole?: string | null
  showCloseButton?: boolean
}

export function PasswordDisplayModal({
  open,
  onOpenChange,
  users,
  currentUserRole,
  showCloseButton = false,
}: PasswordDisplayModalProps) {
  const { toast } = useToast()
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  // Load passwords from localStorage
  useEffect(() => {
    if (open) {
      try {
        const storedPasswords = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
        const passwordsForUsers: Record<string, string> = {}

        users.forEach((user) => {
          if (storedPasswords[user.email]) {
            passwordsForUsers[user.email] = storedPasswords[user.email]
          }
        })

        setPasswords(passwordsForUsers)

        // Initialize copied and showPasswords states
        const initialCopied: Record<string, boolean> = {}
        const initialShowPasswords: Record<string, boolean> = {}

        users.forEach((user) => {
          initialCopied[user.email] = false
          initialShowPasswords[user.email] = false
        })

        setCopied(initialCopied)
        setShowPasswords(initialShowPasswords)
      } catch (err) {
        console.error("Error loading passwords from localStorage:", err)
      }
    }
  }, [open, users])

  // Copy password to clipboard
  const copyToClipboard = (email: string) => {
    if (passwords[email]) {
      navigator.clipboard
        .writeText(passwords[email])
        .then(() => {
          setCopied((prev) => ({ ...prev, [email]: true }))

          toast({
            title: "Password copied",
            description: "Password has been copied to clipboard",
          })

          setTimeout(() => {
            setCopied((prev) => ({ ...prev, [email]: false }))
          }, 2000)
        })
        .catch((err) => {
          console.error("Failed to copy password:", err)

          toast({
            title: "Error",
            description: "Failed to copy password to clipboard",
            variant: "destructive",
          })
        })
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (email: string) => {
    setShowPasswords((prev) => ({ ...prev, [email]: !prev[email] }))
  }

  // Handle explicit close button click
  const handleClose = () => {
    onOpenChange(false)
  }

  // Determine if a password should be shown based on user roles
  const shouldShowPassword = (userType: string): boolean => {
    if (!currentUserRole) return true // If no role is provided, show all passwords

    // Role-based visibility rules
    if (currentUserRole === "admin") return true // Admins see all passwords

    if (currentUserRole === "tutor") {
      // Tutors can only see tutor passwords
      return userType === "tutor"
    }

    if (currentUserRole === "parent") {
      // Parents can see parent and student passwords, but not tutor passwords
      return userType === "parent" || userType === "student"
    }

    return false // Default: don't show
  }

  // Filter users based on role visibility
  const visibleUsers = users.filter((user) => shouldShowPassword(user.userType))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Generated Passwords</DialogTitle>
          <DialogDescription className="text-base mt-2">
            These passwords have been generated for the new users. Please save them securely as they will not be shown
            again.
          </DialogDescription>
          <div className="mb-2 font-medium text-green-600">User created successfully!</div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {visibleUsers.length > 0 && Object.keys(passwords).length > 0 ? (
            visibleUsers.map((user) =>
              passwords[user.email] ? (
                <div key={user.email} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {user.name || user.email} ({user.userType})
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        value={passwords[user.email]}
                        type={showPasswords[user.email] ? "text" : "password"}
                        readOnly
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(user.email)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      >
                        {showPasswords[user.email] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPasswords[user.email] ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(user.email)}
                      className="w-10 p-0"
                    >
                      {copied[user.email] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy password</span>
                    </Button>
                  </div>
                </div>
              ) : null,
            )
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {users.length > 0 && visibleUsers.length === 0
                  ? "You don't have permission to view these passwords."
                  : "No passwords found for the selected users."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {showCloseButton && (
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
