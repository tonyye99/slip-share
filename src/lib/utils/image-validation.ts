export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateReceiptImage = (file: File): ValidationResult => {
  const errors: string[] = []

  if (
    !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
  ) {
    errors.push('Please use JPEG, PNG, or WebP format')
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    errors.push('Image must be smaller than 10MB')
  }

  if (file.size < 1024) {
    // 1KB
    errors.push('File appears to be corrupted')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
