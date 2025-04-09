"use client"

import { useState, useCallback } from "react"

type ToastType = "default" | "success" | "error" | "warning" | "info" | "destructive"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastType
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)

    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration,
      visible: true,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t)))

        // Remove from DOM after animation
        setTimeout(() => {
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
        }, 300)
      }, duration)
    }

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t)))

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 300)
  }, [])

  return { toast, dismiss, toasts }
}
