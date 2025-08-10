'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { CostCalculatorProps } from '@/types/components'

export default function CostCalculator({
  items,
  selectedItems,
  itemShares,
  receipt,
  isPayer,
  currency = '₿',
}: CostCalculatorProps) {
  const formatCurrency = (amount: number) => {
    return `${currency} ${amount?.toFixed(2) ?? '0.00'}`
  }

  // Calculate selected items subtotal with sharing
  const selectedSubtotal = items
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const itemTotal = item.qty * item.unit_price
      const shareCount = itemShares[item.id] || 1
      const userShare = itemTotal / shareCount
      return sum + userShare
    }, 0)

  // Calculate proportional charges
  const proportion =
    receipt.subtotal > 0 ? selectedSubtotal / receipt.subtotal : 0

  const proportionalTax = (receipt.tax_percent / 100) * selectedSubtotal
  const proportionalService = (receipt.service_percent / 100) * selectedSubtotal
  const proportionalRounding = receipt.rounding * proportion

  // Calculate final total
  const finalTotal =
    selectedSubtotal +
    proportionalTax +
    proportionalService +
    proportionalRounding

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isPayer ? 'Your Consumption' : 'Your Share'}</span>
          <Badge variant="secondary">
            {selectedItems.length} of {items.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedItems.length > 0 ? (
          <>
            {/* Selected Items Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Selected Items:</h4>
              <div className="space-y-1 text-sm">
                {items
                  .filter((item) => selectedItems.includes(item.id))
                  .map((item) => {
                    const itemTotal = item.qty * item.unit_price
                    const shareCount = itemShares[item.id] || 1
                    const userShare = itemTotal / shareCount

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>
                          {item.name} (×{item.qty})
                          {shareCount > 1 && (
                            <span className="text-xs ml-1 text-blue-600">
                              ÷{shareCount} people
                            </span>
                          )}
                        </span>
                        <span>
                          {shareCount > 1 ? (
                            <span>
                              {formatCurrency(itemTotal)} ÷ {shareCount} ={' '}
                              {formatCurrency(userShare)}
                            </span>
                          ) : (
                            formatCurrency(userShare)
                          )}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Selected Items Subtotal</span>
                <span>{formatCurrency(selectedSubtotal)}</span>
              </div>

              {receipt.service_percent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Your Service Charge ({receipt.service_percent}%)</span>
                  <span>{formatCurrency(proportionalService)}</span>
                </div>
              )}

              {receipt.tax_percent > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Your Tax ({receipt.tax_percent}%)</span>
                  <span>{formatCurrency(proportionalTax)}</span>
                </div>
              )}

              {Math.abs(proportionalRounding) > 0.001 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Your Rounding Adjustment</span>
                  <span>
                    {proportionalRounding >= 0 ? '+' : ''}
                    {formatCurrency(proportionalRounding)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>
                  {isPayer ? 'Your Consumption Total' : 'Amount You Owe'}
                </span>
                <span className="text-primary">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {/* Proportion Info */}
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                {isPayer ? (
                  <>
                    You consumed{' '}
                    <span className="font-medium">
                      {(proportion * 100).toFixed(1)}%
                    </span>{' '}
                    of the total bill ({formatCurrency(receipt.total)})
                  </>
                ) : (
                  <>
                    Your share is{' '}
                    <span className="font-medium">
                      {(proportion * 100).toFixed(1)}%
                    </span>{' '}
                    of the total bill ({formatCurrency(receipt.total)})
                  </>
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select items above to see your total cost</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
