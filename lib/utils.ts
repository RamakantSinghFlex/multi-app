import DOMPurify from "dompurify"

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html The HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

/**
 * Class names utility
 *
 * Conditionally join classNames together.
 */
type ClassValue = string | number | boolean | undefined | null

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ")
}
