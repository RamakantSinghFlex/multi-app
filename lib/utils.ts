import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sanitizeHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Use a basic sanitizer on the server
    return String(html).replace(/<[^>]*>/g, "")
  }

  return DOMPurify.sanitize(html)
}
