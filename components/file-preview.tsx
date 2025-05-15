"use client"

import { useState, useEffect } from "react"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileInfo {
  name: string
  size: number
  type: string
}

interface FilePreviewProps {
  file?: File
  fileInfo?: FileInfo
  onRemove?: () => void
}

export function FilePreview({ file, fileInfo, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const fileName = file?.name || fileInfo?.name || "Unknown file"
  const fileSize = file?.size || fileInfo?.size || 0
  const fileType = file?.type || fileInfo?.type || ""

  useEffect(() => {
    if (!file) return

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [file])

  const isImage = fileType.startsWith("image/")
  const fileExtension = fileName.split(".").pop()?.toUpperCase()

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md mb-2 max-w-full">
      {isImage && preview ? (
        <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
          <img
            src={preview || "/placeholder.svg"}
            alt={fileName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
          <FileText className="h-8 w-8 text-gray-500" />
          {fileExtension && (
            <span className="absolute text-xs font-bold">{fileExtension}</span>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs text-gray-500">
          {(fileSize / 1024).toFixed(1)} KB
        </p>
      </div>

      {onRemove && (
        <Button
          onClick={onRemove}
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
