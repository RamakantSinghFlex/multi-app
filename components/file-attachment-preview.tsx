import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileAttachmentPreviewProps {
  file: File
  onRemove: () => void
  uploadProgress?: number
  isUploading?: boolean
}

export function FileAttachmentPreview({
  file,
  onRemove,
  uploadProgress = 0,
  isUploading = false,
}: FileAttachmentPreviewProps) {
  // Determine if file is an image
  const isImage = file.type.startsWith("image/")

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Generate preview URL for images
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isImage) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file, isImage])

  return (
    <div className="mt-2 p-2 bg-gray-50 border rounded-md relative">
      <div className="flex items-center gap-3">
        {isImage && previewUrl ? (
          <div className="h-12 w-12 overflow-hidden rounded">
            <img
              src={previewUrl}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded">
            <span className="text-xs font-medium uppercase">
              {file.name.split(".").pop() || "File"}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

          {isUploading && (
            <Progress value={uploadProgress} className="h-1 mt-1" />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={onRemove}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
