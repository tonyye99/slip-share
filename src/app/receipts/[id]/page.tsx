'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLayout } from '@/components/layout/page-layout'
import ReceiptItemSelector from '@/components/receipt-item-selector'
import CostCalculator from '@/components/cost-calculator'
import { LanguageToggle } from '@/components/language-toggle'

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
  const { getDisplayMerchantName, hasTranslation } = useLanguage()
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
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-32"></div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorState error={error} onRetry={() => router.push('/home')} />
      </PageLayout>
    )
  }

  if (!receiptData) {
    return (
      <PageLayout>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">Receipt not found</h3>
            <p className="text-gray-600">
              This receipt doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  const { receipt, userSelection, isCreator, isPayer } = receiptData

  return (
    <PageLayout maxWidth="4xl">
      {/* Receipt Header */}
      <div className="space-y-6">
        <LanguageToggle
          merchantNameEn={receipt.merchant_name_en}
          itemsWithTranslation={receipt.receipts_items.some((item) =>
            hasTranslation(item.name_en)
          )}
        />
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    {getDisplayMerchantName(
                      receipt.merchant_name,
                      receipt.merchant_name_en
                    ) || 'Receipt'}
                  </h1>
                </div>
                <p className="text-sm text-gray-500">
                  Receipt ID: {receipt.id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isPayer && (
                  <Badge className="bg-gray-100 text-gray-700 border-0 hover:bg-gray-200">
                    Bill Payer
                  </Badge>
                )}
                {isCreator && !isPayer && (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-600 border-gray-200"
                  >
                    Sharer
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {receipt.currency}
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-600 font-medium">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {receipt.currency} {receipt.total?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-600 font-medium">Tax Rate</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {receipt.tax_percent}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-600 font-medium">
                  Service Rate
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {receipt.service_percent}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-600 font-medium">Items Count</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {receipt.receipts_items.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-7">
          <ReceiptItemSelector
            items={receipt.receipts_items}
            selectedItems={selectedItems}
            itemShares={itemShares}
            onItemToggle={handleItemToggle}
            onShareCountChange={handleShareCountChange}
            currency={receipt.currency}
          />

          <div className="space-y-6">
            <CostCalculator
              items={receipt.receipts_items}
              selectedItems={selectedItems}
              itemShares={itemShares}
              receipt={receipt}
              isPayer={isPayer}
              currency={receipt.currency}
            />

            <Button
              onClick={handleSaveSelections}
              disabled={saving}
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              size="lg"
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>{isPayer ? 'Save Your Consumption' : 'Save Your Selection'}</>
              )}
            </Button>

            {userSelection && (
              <div className="text-center text-sm text-gray-500 mt-3">
                Last saved:{' '}
                {new Date(userSelection.updated_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
