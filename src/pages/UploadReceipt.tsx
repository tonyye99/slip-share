import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Camera, Upload, X, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface UploadedFile {
  file: File
  preview: string
  id: string
}

const UploadReceipt = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles: UploadedFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        newFiles.push({
          file,
          preview,
          id: Math.random().toString(36).substr(2, 9),
        })
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Process files for OCR
    newFiles.forEach((uploadedFile) => {
      processOCR(uploadedFile.file)
    })
  }

  const processOCR = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('OCR processing failed')
      }

      const result = await response.json()
      toast({
        title: 'Receipt processed!',
        description: 'OCR extraction completed successfully.',
      })

      console.log('OCR Result:', result)
    } catch (error) {
      console.error('OCR Error:', error)
      toast({
        title: 'Processing failed',
        description: 'Failed to extract text from receipt.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with navigation and theme toggle */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6 p-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Upload Receipt</h1>
          <p className="text-muted-foreground text-sm">
            Take a photo or upload an image of your receipt
          </p>
        </div>

        {/* Dropzone */}
        <div
          onClick={handleDropzoneClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative w-full h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-4 group"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-medium">
                Tap to upload receipt
              </p>
              <p className="text-muted-foreground text-xs">
                or drag and drop here
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Camera Button */}
        <Button
          onClick={handleCameraClick}
          variant="outline"
          size="lg"
          className="w-full h-14 text-lg"
          disabled={isUploading}
        >
          <Camera className="w-6 h-6 mr-3" />
          Use Camera
        </Button>

        {/* File Previews */}
        {uploadedFiles.length > 0 && (
          <div className="w-full space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={uploadedFile.preview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default UploadReceipt
