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

// Format bytes to human-readable format
/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes The file size in bytes
 * @param decimals The number of decimal places to show
 * @returns A formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
