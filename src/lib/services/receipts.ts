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

export interface ReceiptSummary {
  id: string
  merchant_name: string | null
  currency: string
  subtotal: number
  total: number
  user_type: 'payer' | 'sharer'
  created_at: string
  receipts_items: Array<{
    id: string
    name: string
    qty: number
    unit_price: number
  }>
}

export interface GetReceiptsResponse {
  receipts: ReceiptSummary[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export async function getReceipts(limit: number = 10, offset: number = 0) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    return apiRequest<GetReceiptsResponse>(`/receipts?${params}`)
  } catch (err) {
    console.error('Error fetching receipts:', err)
    throw err
  }
}
