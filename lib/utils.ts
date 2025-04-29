import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for sanitizing HTML
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Implement your HTML sanitization logic here.
  // This is a placeholder implementation.
  // In a real application, you would use a library like DOMPurify or sanitize-html
  // to properly sanitize the HTML.

  // Example using a basic string replacement (not secure for production use):
  let sanitized = html.replace(/</g, "&lt;")
  sanitized = sanitized.replace(/>/g, "&gt;")
  return sanitized
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
