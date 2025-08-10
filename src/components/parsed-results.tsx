import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import type { ParsedResultsProps, UserType } from '@/types'

export default function ParsedResults({
  data,
  onConfirm,
  onCancel,
  loading = false,
}: ParsedResultsProps) {
  const [userType, setUserType] = useState<UserType>('payer')

  const formatCurrency = (amount: number) => {
    return `₿${amount.toFixed(2)}`
  }

  const calculateItemTotal = (qty: number, unitPrice: number) => {
    return qty * unitPrice
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Confirm Receipt Details</span>
          <Badge variant="outline">
            {data.items.length} item{data.items.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items Table */}
        <div>
          <h3 className="font-medium mb-3">Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={`${item.id}-${index}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      calculateItemTotal(item.qty, item.unit_price)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>

          {data.service_percent > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service ({data.service_percent}%)</span>
              <span>
                {formatCurrency((data.subtotal * data.service_percent) / 100)}
              </span>
            </div>
          )}

          {data.tax_percent > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax ({data.tax_percent}%)</span>
              <span>
                {formatCurrency((data.subtotal * data.tax_percent) / 100)}
              </span>
            </div>
          )}

          {data.rounding !== 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Rounding</span>
              <span>{formatCurrency(data.rounding)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>

        <Separator />

        {/* User Role Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Who paid this bill?</h3>
            <div className="space-y-3">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  userType === 'payer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setUserType('payer')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="userType"
                    value="payer"
                    checked={userType === 'payer'}
                    onChange={() => setUserType('payer')}
                    className="h-4 w-4"
                  />
                  <div>
                    <Label className="font-medium">I paid this bill</Label>
                    <p className="text-sm text-muted-foreground">
                      You want to see how much others owe you
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  userType === 'sharer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setUserType('sharer')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="userType"
                    value="sharer"
                    checked={userType === 'sharer'}
                    onChange={() => setUserType('sharer')}
                    className="h-4 w-4"
                  />
                  <div>
                    <Label className="font-medium">
                      Someone else paid this bill
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      You want to calculate how much you owe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(userType)}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
