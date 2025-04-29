"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PasswordDisplayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: Array<{ email: string; userType: string; name?: string }>
  currentUserRole?: string
  showCloseButton?: boolean
}

export function PasswordDisplayModal({
  open,
  onOpenChange,
  users,
  currentUserRole = "admin",
  showCloseButton = false,
}: PasswordDisplayModalProps) {
  const { toast } = useToast()
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  // Toggle password visibility for a specific user
  const togglePasswordVisibility = (email: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [email]: !prev[email],
    }))
  }

  // Copy password to clipboard
  const copyToClipboard = (email: string) => {
    try {
      // Get the password from localStorage
      const passwordsMap = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
      const password = passwordsMap[email]

      if (password) {
        navigator.clipboard.writeText(password)

        // Set copied state for this email
        setCopiedStates((prev) => ({
          ...prev,
          [email]: true,
        }))

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedStates((prev) => ({
            ...prev,
            [email]: false,
          }))
        }, 2000)

        toast({
          title: "Password copied",
          description: "Password has been copied to clipboard",
        })
      } else {
        toast({
          title: "Error",
          description: "Password not found for this user",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error copying password:", err)
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      })
    }
  }

  // Get password for a specific user
  const getPassword = (email: string): string => {
    try {
      const passwordsMap = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
      return passwordsMap[email] || "••••••••"
    } catch (err) {
      console.error("Error retrieving password:", err)
      return "••••••••"
    }
  }

  // Format password for display (show or hide)
  const formatPassword = (email: string): string => {
    const password = getPassword(email)
    return showPasswords[email] ? password : "•".repeat(password.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generated Passwords</DialogTitle>
          <DialogDescription>
            These passwords are generated securely and stored temporarily. Please save them now.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {users.map((user) => (
            <div key={user.email} className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{user.name || user.email}</h3>
                  <p className="text-sm text-muted-foreground">{user.userType}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => togglePasswordVisibility(user.email)}>
                  {showPasswords[user.email] ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPasswords[user.email] ? "Hide" : "Show"}
                </Button>
              </div>
              <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                <code className="text-sm font-mono">{formatPassword(user.email)}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.email)}
                  disabled={copiedStates[user.email]}
                >
                  {copiedStates[user.email] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <p>These passwords are only stored temporarily in your browser.</p>
          </div>
          {showCloseButton && (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
