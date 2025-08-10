'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReceiptItemSelector from '@/components/receipt-item-selector'
import CostCalculator from '@/components/cost-calculator'

import type { ShareCounts } from '@/types/common'
import { ErrorState } from '@/components/error-state'
import {
  getReceipt,
  saveSelections,
  updateSelections,
} from '@/lib/services/receipts'
import { ApiError } from '@/lib/api'
import { ReceiptData } from '@/types/database'

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemShares, setItemShares] = useState<ShareCounts>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchReceipt = async () => {
      try {
        const data = await getReceipt(params.id)

        setReceiptData(data)

        // Set initial selected items and shares from user's existing selection
        if (data.userSelection?.selected_items) {
          setSelectedItems(data.userSelection.selected_items)
        }
        if (data.userSelection?.item_shares) {
          setItemShares(data.userSelection.item_shares)
        }
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('Error fetching receipt:', err)
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [params.id, user, authLoading])

  const handleItemToggle = (itemId: string, isSelected: boolean) => {
    setSelectedItems((prev) => {
      if (isSelected) {
        // When selecting an item, initialize its share count to 1 if not already set
        if (!itemShares[itemId]) {
          setItemShares((prevShares) => ({ ...prevShares, [itemId]: 1 }))
        }
        return [...prev, itemId]
      } else {
        return prev.filter((id) => id !== itemId)
      }
    })
  }

  const handleShareCountChange = (itemId: string, shareCount: number) => {
    setItemShares((prev) => ({ ...prev, [itemId]: shareCount }))
  }

  const handleSaveSelections = async () => {
    if (!receiptData || !user) return

    setSaving(true)
    try {
      const selectionData = {
        selected_items: selectedItems,
        item_shares: itemShares,
      }

      const updatedSelection = receiptData.userSelection
        ? await updateSelections(params.id, selectionData)
        : await saveSelections(params.id, selectionData)

      setReceiptData((prev) =>
        prev
          ? {
              ...prev,
              userSelection: updatedSelection,
            }
          : null
      )

      alert('Your selections have been saved!')
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('Error saving selections:', err)
        alert(`Failed to save selections: ${err.message}`)
      } else {
        console.error('Error saving selections:', err)
        alert('Failed to save selections. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => router.push('/home')} />
  }

  if (!receiptData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">No receipt data available</div>
      </div>
    )
  }

  const { receipt, userSelection, isCreator, isPayer } = receiptData

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Receipt Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {receipt.merchant_name || 'Receipt'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Receipt ID: {receipt.id}
              </p>
            </div>
            <div className="flex gap-2">
              {isPayer && <Badge variant="secondary">Bill Payer</Badge>}
              {isCreator && !isPayer && <Badge variant="outline">Sharer</Badge>}
              <Badge variant="outline">{receipt.currency}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Original Total</p>
              <p className="font-medium">
                {receipt.currency}
                {receipt.total?.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tax</p>
              <p className="font-medium">{receipt.tax_percent}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-medium">{receipt.service_percent}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Items</p>
              <p className="font-medium">{receipt.receipts_items.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Item Selection */}
        <div>
          <ReceiptItemSelector
            items={receipt.receipts_items}
            selectedItems={selectedItems}
            itemShares={itemShares}
            onItemToggle={handleItemToggle}
            onShareCountChange={handleShareCountChange}
            currency={receipt.currency}
          />
        </div>

        {/* Right Column: Cost Calculator */}
        <div className="space-y-4">
          <CostCalculator
            items={receipt.receipts_items}
            selectedItems={selectedItems}
            itemShares={itemShares}
            receipt={receipt}
            isPayer={isPayer}
            currency={receipt.currency}
          />

          {/* Save Button */}
          <Button
            onClick={handleSaveSelections}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving
              ? 'Saving...'
              : isPayer
                ? 'Save Your Consumption'
                : 'Save Your Selection'}
          </Button>

          {userSelection && (
            <div className="text-center text-sm text-muted-foreground">
              Last saved:{' '}
              {new Date(userSelection.updated_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
