"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, ImageIcon, FileText, Loader2 } from "lucide-react"
import { formatBytes } from "@/lib/utils"

interface ChatAttachmentButtonProps {
  onFileSelected: (file: File) => void
  isUploading: boolean
}

export function ChatAttachmentButton({ onFileSelected, isUploading }: ChatAttachmentButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleAttachmentClick = () => {
    if (selectedFile) {
      // If a file is already selected, send it
      onFileSelected(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else {
      // Otherwise, open file selector
      fileInputRef.current?.click()
    }
  }

  const cancelSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />

      {selectedFile && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-md border bg-white p-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preview</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl ? (
            <div className="mt-2">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-32 w-auto rounded" />
            </div>
          ) : (
            <div className="mt-2 flex items-center space-x-2 rounded border p-2">
              {selectedFile.type.includes("pdf") ? (
                <FileText className="h-8 w-8 text-red-500" />
              ) : selectedFile.type.includes("word") ? (
                <FileText className="h-8 w-8 text-blue-500" />
              ) : selectedFile.type.includes("sheet") || selectedFile.type.includes("excel") ? (
                <FileText className="h-8 w-8 text-green-500" />
              ) : (
                <FileText className="h-8 w-8 text-gray-500" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[180px]">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</span>
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">Click the paperclip icon to send this file</div>
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleAttachmentClick}
        disabled={isUploading}
        className="h-9 w-9"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedFile ? (
          previewUrl ? (
            <ImageIcon className="h-4 w-4 text-green-500" />
          ) : (
            <FileText className="h-4 w-4 text-green-500" />
          )
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
