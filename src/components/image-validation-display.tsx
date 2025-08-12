'use client'

import { AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ValidationResult } from '@/lib/utils/image-validation'

interface ImageValidationDisplayProps {
  result: ValidationResult | null
  fileName?: string
}

export default function ImageValidationDisplay({
  result,
  fileName,
}: ImageValidationDisplayProps) {
  if (!result) {
    return (
      <Alert>
        <ImageIcon className="h-4 w-4 animate-pulse" />
        <AlertDescription>Validating image...</AlertDescription>
      </Alert>
    )
  }

  if (!result) {
    return null
  }

  const getStatusIcon = () => {
    if (result.errors.length > 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (result.errors.length > 0) {
      return 'Validation Failed'
    }
    return 'Ready for Processing'
  }

  return (
    <div className="space-y-3">
      {/* Main Status */}
      <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
        {getStatusIcon()}
        <AlertDescription>{getStatusText()}</AlertDescription>
      </Alert>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-700">Issues to Fix:</h4>
          <ul className="space-y-1">
            {result.errors.map((error, index) => (
              <li
                key={index}
                className="text-sm text-red-600 flex items-start gap-2"
              >
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Info */}
      {fileName && (
        <div className="text-xs text-gray-500">File: {fileName}</div>
      )}
    </div>
  )
}
