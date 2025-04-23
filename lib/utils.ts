import DOMPurify from "isomorphic-dompurify"

export const cn = (...inputs: (string | undefined | null | boolean)[]): string => {
  return inputs.filter(Boolean).join(" ")
}

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html)
}
