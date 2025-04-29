import DOMPurify from "dompurify"

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(" ")
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}
