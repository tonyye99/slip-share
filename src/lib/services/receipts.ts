import type {
  CreateReceiptRequest,
  CreateReceiptResponse,
  SaveSelectionsRequest,
} from '@/types/api'
import { apiRequest } from '@/lib/api'
import { ReceiptData, UserSelection } from '@/types/database'

export async function createReceipt(data: CreateReceiptRequest) {
  try {
    return apiRequest<CreateReceiptResponse>('/receipts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Error creating receipt:', err)
    throw err
  }
}

export async function getReceipt(id: string) {
  try {
    return apiRequest<ReceiptData>(`/receipts/${id}`)
  } catch (err) {
    console.error('Error getting receipt:', err)
    throw err
  }
}

export async function saveSelections(id: string, data: SaveSelectionsRequest) {
  try {
    return apiRequest<UserSelection>(`/receipts/${id}/selections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Error saving selections:', err)
    throw err
  }
}

export async function updateSelections(
  id: string,
  data: SaveSelectionsRequest
) {
  try {
    return apiRequest<UserSelection>(`/receipts/${id}/selections`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Error updating selections:', err)
    throw err
  }
}
