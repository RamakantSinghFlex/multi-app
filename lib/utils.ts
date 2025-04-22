import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "isomorphic-dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify with allowed tags and attributes
  DOMPurify.setConfig({
    ALLOWED_TAGS: [
      "a",
      "b",
      "br",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "i",
      "li",
      "ol",
      "p",
      "span",
      "strong",
      "ul",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
    FORBID_TAGS: ["script", "style", "iframe", "frame", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  })

  return DOMPurify.sanitize(html)
}

/**
 * Get sessions from the API
 * @returns A response containing the sessions data
 */
export function getSessions() {
  // This is a placeholder implementation
  // In a real application, this would fetch sessions from the server
  return {
    data: {
      sessions: [],
    },
  }
}
