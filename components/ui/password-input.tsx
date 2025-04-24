"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { generateSecurePassword } from "@/lib/utils/password-generator"

// Password strength requirements - could be moved to config
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REQUIRES_UPPERCASE = true
const PASSWORD_REQUIRES_LOWERCASE = true
const PASSWORD_REQUIRES_NUMBER = true
const PASSWORD_REQUIRES_SPECIAL = false

export interface PasswordInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onGeneratePassword?: (password: string) => void
  disabled?: boolean
  label?: string
  placeholder?: string
  showStrengthIndicator?: boolean
  showGenerateButton?: boolean
  autoComplete?: string
  required?: boolean
  className?: string
  error?: string
}

export function PasswordInput({
  id,
  value,
  onChange,
  onGeneratePassword,
  disabled = false,
  label,
  placeholder,
  showStrengthIndicator = false,
  showGenerateButton = true,
  autoComplete = "new-password",
  required = false,
  className = "",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Calculate password strength when password changes
  useEffect(() => {
    if (!value || !showStrengthIndicator) {
      setPasswordStrength(0)
      return
    }

    let strength = 0

    // Length check
    if (value.length >= PASSWORD_MIN_LENGTH) strength += 1

    // Uppercase check
    if (PASSWORD_REQUIRES_UPPERCASE && /[A-Z]/.test(value)) strength += 1

    // Lowercase check
    if (PASSWORD_REQUIRES_LOWERCASE && /[a-z]/.test(value)) strength += 1

    // Number check
    if (PASSWORD_REQUIRES_NUMBER && /[0-9]/.test(value)) strength += 1

    // Special character check
    if (PASSWORD_REQUIRES_SPECIAL && /[^A-Za-z0-9]/.test(value)) strength += 1

    setPasswordStrength(strength)
  }, [value, showStrengthIndicator])

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12)
    onChange(newPassword)

    if (onGeneratePassword) {
      onGeneratePassword(newPassword)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`pr-20 ${className}`}
          autoComplete={autoComplete}
          required={required}
        />
        <div className="absolute inset-y-0 right-0 flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-full px-2 text-xs"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          {showGenerateButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full px-2 text-xs"
              onClick={handleGeneratePassword}
              disabled={disabled}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Generate
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {/* Password strength indicator */}
      {showStrengthIndicator && value && (
        <div className="mt-2">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${
                passwordStrength === 0
                  ? "w-0"
                  : passwordStrength === 1
                    ? "w-1/4 bg-red-500"
                    : passwordStrength === 2
                      ? "w-2/4 bg-orange-500"
                      : passwordStrength === 3
                        ? "w-3/4 bg-yellow-500"
                        : "w-full bg-green-500"
              }`}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {passwordStrength === 0
              ? "Very weak"
              : passwordStrength === 1
                ? "Weak"
                : passwordStrength === 2
                  ? "Fair"
                  : passwordStrength === 3
                    ? "Good"
                    : "Strong"}
          </p>
        </div>
      )}
    </div>
  )
}
