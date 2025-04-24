import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for sanitizing HTML
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary DOM element
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  // Remove potentially harmful elements and attributes
  const sanitizedHtml = tempDiv.innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  return sanitizedHtml
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
