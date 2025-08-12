'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReceiptCard, ReceiptCardSkeleton } from '@/components/receipt-card'
import { getReceipts, type ReceiptSummary } from '@/lib/services/receipts'

interface RecentReceiptsProps {
  limit?: number
  showViewAll?: boolean
}

export default function RecentReceipts({
  limit = 5,
  showViewAll = true,
}: RecentReceiptsProps) {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await getReceipts(limit, 0)
        setReceipts(response.receipts)
      } catch (err) {
        console.error('Error fetching recent receipts:', err)
        setError('Failed to load recent receipts')
      } finally {
        setLoading(false)
      }
    }

    fetchReceipts()
  }, [limit])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Receipts</h3>
          {showViewAll && (
            <Link href="/receipts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <ReceiptCardSkeleton key={i} variant="horizontal" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Receipts</h3>
          {showViewAll && (
            <Link href="/receipts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
        <Card className="min-w-[300px] bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (receipts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Recent Receipts</h3>
          {showViewAll && (
            <Link href="/receipts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
        <Card className="min-w-[300px] bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-600">
              No receipts uploaded yet. Upload your first bill to get started!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Recent Receipts</h3>
        {showViewAll && (
          <Link href="/receipts">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {receipts.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            variant="horizontal"
          />
        ))}
      </div>
    </div>
  )
}
