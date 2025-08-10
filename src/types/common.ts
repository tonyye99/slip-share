// Common utility types used across the application

export type UserType = 'payer' | 'sharer'

export type Currency = 'THB' | 'USD' | 'EUR' | 'GBP' // Add more as needed

export interface ShareCounts {
  [itemId: string]: number
}

// Utility types
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type PaymentStatus = 'pending' | 'confirmed' | 'paid'

// Form validation
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  isSubmitting: boolean
  isDirty: boolean
}

export interface ErrorStateProps {
  error: string
  onRetry?: () => void
  variant?: 'default' | 'not-found' | 'access-denied'
}
