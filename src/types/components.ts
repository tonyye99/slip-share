import type { ReceiptItem, Receipt, ParsedReceiptData } from './database'
import type { ParsedItem } from './api'

// ReceiptItemSelector component props
export interface ReceiptItemSelectorProps {
  items: ReceiptItem[]
  selectedItems: string[]
  itemShares: Record<string, number>
  onItemToggle: (itemId: string, isSelected: boolean) => void
  onShareCountChange: (itemId: string, shareCount: number) => void
  currency?: string
}

// CostCalculator component props
export interface CostCalculatorProps {
  items: ReceiptItem[]
  selectedItems: string[]
  itemShares: Record<string, number>
  receipt: Receipt
  isPayer: boolean
  currency?: string
}

// ParsedResults component props
export interface ParsedResultsProps {
  data: ParsedReceiptData
  onConfirm: (userType: 'payer' | 'sharer') => void
  onCancel: () => void
  loading?: boolean
}

// Common component props
export interface LoadingProps {
  loading?: boolean
  disabled?: boolean
}

export interface CurrencyProps {
  currency?: string
  amount: number
}