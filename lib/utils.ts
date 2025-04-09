import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content by removing potentially problematic tags
 * that could cause hydration errors
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return (
    html
      // Remove doctype
      .replace(/<!DOCTYPE[^>]*>/i, "")
      // Remove html tags
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      // Remove head tags and their content
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      // Remove body tags but keep their content
      .replace(/<body[^>]*>/gi, "")
      .replace(/<\/body>/gi, "")
      // Remove script tags and their content for security
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      // Remove style tags and their content to avoid conflicts
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove any other potentially problematic tags
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<frame[\s\S]*?<\/frame>/gi, "")
      .replace(/<frameset[\s\S]*?<\/frameset>/gi, "")
      .replace(/<object[\s\S]*?<\/object>/gi, "")
      .replace(/<embed[\s\S]*?<\/embed>/gi, "")
      .replace(/<applet[\s\S]*?<\/applet>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<link[^>]*>/gi, "")
      .replace(/<base[^>]*>/gi, "")
      .trim()
  )
}
