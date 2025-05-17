import { API_URL } from "@/lib/config"

export const getMediaUrl = (filename: string): string => {
  return `${API_URL}/media/file/${filename}`
}
