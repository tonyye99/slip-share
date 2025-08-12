'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/contexts/language-context'
import { formatCurrency as formatCurrencyHelper } from '@/lib/utils/helpers'
import type { ReceiptItemSelectorProps } from '@/types/components'

export default function ReceiptItemSelector({
  items,
  selectedItems,
  itemShares,
  onItemToggle,
  onShareCountChange,
  currency = '₿',
}: ReceiptItemSelectorProps) {
  const { getDisplayText } = useLanguage()

  const formatCurrency = (amount: number) => {
    if (currency === '₿') {
      return `${currency}${amount.toFixed(2)}`
    }
    return formatCurrencyHelper(amount, currency)
  }

  const calculateItemTotal = (qty: number, unitPrice: number) => {
    return qty * unitPrice
  }

  const handleItemCheck = (itemId: string) => {
    const isCurrentlySelected = selectedItems.includes(itemId)
    onItemToggle(itemId, !isCurrentlySelected)
  }

  const handleShareCountChange = (itemId: string, value: string) => {
    const shareCount = parseInt(value) || 1
    if (shareCount >= 1 && shareCount <= 99) {
      onShareCountChange(itemId, shareCount)
    }
  }

  const getShareCount = (itemId: string) => {
    return itemShares[itemId] || 1
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Items</h3>
        <p className="text-sm text-muted-foreground">
          Choose the items you want to include in your share of the bill
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center w-32">Share With</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isSelected = selectedItems.includes(item.id)
            const itemTotal = calculateItemTotal(item.qty, item.unit_price)
            const shareCount = getShareCount(item.id)

            return (
              <TableRow
                key={item.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleItemCheck(item.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {getDisplayText(item.name, item.name_en)}
                </TableCell>
                <TableCell className="text-center">{item.qty}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unit_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(itemTotal)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={shareCount}
                      onChange={(e) =>
                        handleShareCountChange(item.id, e.target.value)
                      }
                      disabled={!isSelected}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-xs text-muted-foreground">
                      people
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
