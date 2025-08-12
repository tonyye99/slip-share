'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReceiptCard, ReceiptCardSkeleton } from '@/components/receipt-card'
import { getReceipts, type ReceiptSummary } from '@/lib/services/receipts'

const RECEIPTS_PER_PAGE = 12

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: RECEIPTS_PER_PAGE,
    offset: 0,
    hasMore: false,
  })

  const fetchReceipts = async (offset: number = 0, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const response = await getReceipts(RECEIPTS_PER_PAGE, offset)

      if (append) {
        setReceipts((prev) => [...prev, ...response.receipts])
      } else {
        setReceipts(response.receipts)
      }

      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching receipts:', err)
      setError('Failed to load receipts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [])

  const handleLoadMore = () => {
    const newOffset = pagination.offset + pagination.limit
    fetchReceipts(newOffset, true)
  }

  if (loading) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">All Receipts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ReceiptCardSkeleton key={i} />
          ))}
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">All Receipts</h1>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchReceipts()}>Try Again</Button>
          </CardContent>
        </Card>
      </>
    )
  }

  if (receipts.length === 0) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">All Receipts</h1>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">No receipts yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first bill to get started with tracking your expenses!
            </p>
            <Link href="/">
              <Button>Upload a Receipt</Button>
            </Link>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Receipts</h1>
        <p className="text-gray-600">
          {pagination.total} receipt{pagination.total !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} className="h-full" />
        ))}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
            className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  )
}
