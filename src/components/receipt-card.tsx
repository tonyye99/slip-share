import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/helpers'
import type { ReceiptSummary } from '@/lib/services/receipts'

interface ReceiptCardProps {
  receipt: ReceiptSummary
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export function ReceiptCard({
  receipt,
  variant = 'vertical',
  className = '',
}: ReceiptCardProps) {
  const cardContent = (
    <Card
      className={`
        min-w-[240px] w-[240px] bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden ${className}
      `}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate text-base">
                {receipt.merchant_name || 'Unknown Merchant'}
              </h4>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(receipt.created_at)}
              </p>
            </div>
            <Badge
              variant={receipt.user_type === 'payer' ? 'default' : 'secondary'}
              className="text-xs shrink-0 ml-3 bg-gray-100 text-gray-700 border-0 hover:bg-gray-200"
            >
              {receipt.user_type === 'payer' ? 'Paid' : 'Share'}
            </Badge>
          </div>

          {/* Amount */}
          <div className="py-3">
            <p
              className={`font-bold text-gray-900 tracking-tight ${
                variant === 'horizontal' ? 'text-xl' : 'text-2xl'
              }`}
            >
              {formatCurrency(receipt.total, receipt.currency)}
            </p>
          </div>

          {/* Items Preview */}
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {receipt.receipts_items.length} item
                {receipt.receipts_items.length !== 1 ? 's' : ''}
              </span>
              {receipt.receipts_items.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </div>
            {receipt.receipts_items.length > 0 && (
              <div className="mt-1 text-gray-500 text-xs truncate">
                {receipt.receipts_items
                  .slice(0, 2)
                  .map((item) => item.name)
                  .join(', ')}
                {receipt.receipts_items.length > 2 &&
                  ` +${receipt.receipts_items.length - 2} more`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Link
      href={`/receipts/${receipt.id}`}
      className={`block ${variant === 'horizontal' ? 'flex-shrink-0 snap-start' : ''}`}
    >
      {cardContent}
    </Link>
  )
}

export function ReceiptCardSkeleton({
  variant = 'vertical',
  className = '',
}: {
  variant?: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <Card
      className={`
        min-w-[240px] w-[240px] bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden animate-pulse ${className}
      `}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-12 ml-3"></div>
          </div>
          <div className="py-3">
            <div
              className={`bg-gray-200 rounded-lg w-2/3 ${
                variant === 'horizontal' ? 'h-6' : 'h-8'
              }`}
            ></div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
