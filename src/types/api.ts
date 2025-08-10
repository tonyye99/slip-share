// API request and response types

// Receipt creation
export interface CreateReceiptRequest {
  merchant_name?: string
  currency: string
  tax_percent: number
  service_percent: number
  rounding?: number
  raw_json?: unknown
  parser_version?: string
  issued_at?: string
  storage_key?: string
  user_type: 'payer' | 'sharer'
  items: CreateReceiptItem[]
  total?: number
  subtotal?: number
}

export interface CreateReceiptItem {
  name: string
  qty: number
  unit_price: number
}

export interface CreateReceiptResponse {
  receipt_id: string
}

// User selections
export interface SaveSelectionsRequest {
  selected_items: string[]
  item_shares: Record<string, number>
}

// OCR/Parsing
export interface OCRRequest {
  imageBase64: string
}

export interface OpenAIRequest {
  imageBase64: string
}

export interface OpenAIResponse {
  result: {
    output_text: string
  }
}

export interface ParsedReceiptData {
  items: ParsedItem[]
  tax_percent: number
  service_percent: number
  total: number
  subtotal: number
  rounding: number
}

export interface ParsedItem {
  id: string
  name: string
  qty: number
  unit_price: number
}
