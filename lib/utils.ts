import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for sanitizing HTML content
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Implement your HTML sanitization logic here.
  // This is a placeholder implementation and should be replaced with a robust solution
  // like DOMPurify or a similar library.

  // WARNING: This is NOT a secure implementation and is vulnerable to XSS attacks.
  // DO NOT use this in a production environment.

  // Example: Replace potentially harmful tags and attributes
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  sanitized = sanitized.replace(/onload=[^>]*/gi, "")
  sanitized = sanitized.replace(/onerror=[^>]*/gi, "")
  sanitized = sanitized.replace(/javascript:*/gi, "")

  return sanitized
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
