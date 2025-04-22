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
  // Implement your HTML sanitization logic here.
  // This is a placeholder implementation.
  // In a real application, you should use a robust library like DOMPurify or sanitize-html.
  // For example:
  // import DOMPurify from 'dompurify';
  // return DOMPurify.sanitize(html);

  // Basic escaping for demonstration purposes
  return html?.replace(/</g, "&lt;")?.replace(/>/g, "&gt;")?.replace(/"/g, "&quot;")?.replace(/'/g, "&#039;")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
