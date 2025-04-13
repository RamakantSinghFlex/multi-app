import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // Simple sanitization - remove script tags and on* attributes
  // For production, consider using a library like DOMPurify
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "")
    .replace(/on\w+=\w+/g, "")

  return sanitized
}
