// Database entity types matching the Supabase schema

export interface Receipt {
  id: string
  user_id: string
  merchant_name: string | null
  merchant_name_en: string | null
  original_language: string | null
  currency: string
  tax_percent: number
  service_percent: number
  rounding: number
  subtotal: number
  total: number
  raw_json: unknown
  parser_version: string | null
  issued_at: string | null
  storage_key: string | null
  user_type: 'payer' | 'sharer'
  created_at: string
  updated_at: string
}

export interface ReceiptItem {
  id: string
  receipt_id: string
  position: number
  name: string
  name_en: string | null
  qty: number
  unit_price: number
  created_at: string
  updated_at: string
}

export interface UserSelection {
  id: string
  user_id: string
  receipt_id: string
  selected_items: string[]
  item_shares: Record<string, number>
  calculated_total: number
  tax_amount: number
  service_amount: number
  rounding_amount: number
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface ReceiptWithItems extends Receipt {
  receipts_items: ReceiptItem[]
}

export interface ReceiptData {
  receipt: ReceiptWithItems
  userSelection: UserSelection | null
  isCreator: boolean
  isPayer: boolean
}
