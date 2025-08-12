import { Upload } from 'lucide-react'

interface DropZoneProps {
  isDragOver: boolean
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function LandingDropZone({
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
}: DropZoneProps) {
  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 transition-all duration-200 ${
        isDragOver
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your receipt here
            </p>
            <p className="text-sm text-gray-600">
              or{' '}
              <span className="text-primary font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports JPG, PNG, HEIC up to 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
