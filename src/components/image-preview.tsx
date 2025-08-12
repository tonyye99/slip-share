'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ImagePreviewProps {
  file: File
  onRemove: () => void
  className?: string
}

export default function ImagePreview({
  file,
  onRemove,
  className = '',
}: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  if (!previewUrl) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative group">
            <div className="relative aspect-[3/4] max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Receipt preview"
                fill
                className="object-contain"
                sizes="(max-width: 400px) 100vw, 400px"
              />
            </div>

            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* File Information */}
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>File name:</span>
              <span className="font-medium truncate ml-2">{file.name}</span>
            </div>
            <div className="flex justify-between">
              <span>File size:</span>
              <span className="font-medium">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>File type:</span>
              <span className="font-medium">{file.type}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
