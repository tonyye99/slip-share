import { apiRequest } from '@/lib/api'
import type { OpenAIResponse } from '@/types/api'

export async function parseReceipt(imageBase64: string) {
  try {
    return apiRequest<OpenAIResponse>('/openai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    })
  } catch (err) {
    console.error('Error parsing receipt:', err)
    throw err
  }
}
