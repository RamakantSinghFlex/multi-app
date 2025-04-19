import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return html
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove on* event attributes (onclick, onload, etc.)
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    .replace(/\s+on\w+=\w+/gi, "")
    // Remove javascript: URLs
    .replace(/javascript:[^\s"']+/gi, "")
    // Remove data: URLs
    .replace(/data:[^\s"']+/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove object tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Remove embed tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    // Remove form tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    // Remove base tags
    .replace(/<base\b[^<]*(?:(?!<\/base>)<[^<]*)*<\/base>/gi, "");
}
