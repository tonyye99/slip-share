import { ERROR_MESSAGES } from './constants/error-message'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiError extends Error {
  status: number
  code: string
  message: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.message = message
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const data = await response.json()
    throw new ApiError(
      response.status,
      data.code,
      data.message || `API Error: ${ERROR_MESSAGES.INTERNAL_SERVER_ERROR}`
    )
  }

  return response.json()
}

export { apiRequest, ApiError }
