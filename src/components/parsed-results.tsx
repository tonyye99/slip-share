import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PageLayout } from '@/components/layout/page-layout'
import { useState } from 'react'
import { Receipt, User, Users } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { ParsedResultsProps } from '@/types/components'
import type { UserType } from '@/types/common'
import type { ParsedItem, ParsedReceiptData } from '@/types/api'
import clsx from 'clsx'

// Helper Components
const MetadataInfo = ({ data }: { data: ParsedReceiptData }) => {
  const items = []

  if (data.original_language) {
    items.push(`Language: ${data.original_language.toUpperCase()}`)
  }

  if (data.currency) {
    items.push(`Currency: ${data.currency}`)
  }

  if (data.original_language === 'en' && data.merchant_name_en) {
    items.push('Translation not needed (already English)')
  } else if (data.original_language !== 'en' && data.merchant_name_en) {
    items.push('Translation available')
  }

  return items.length > 0 ? (
    <div className="text-sm text-muted-foreground">{items.join(' • ')}</div>
  ) : null
}

const ItemCard = ({
  item,
  formatCurrency,
  getDisplayText,
}: {
  item: ParsedItem
  formatCurrency: (amount: number) => string
  getDisplayText: (text: string, textEn: string | null) => string
}) => (
  <div className="px-4 py-3 font-mono text-sm hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-gray-900 truncate leading-tight">
          {getDisplayText(item.name, item.name_en || null)}
        </div>
        <div className="text-gray-600 text-xs mt-0.5">
          {item.qty} × {formatCurrency(item.unit_price)}
        </div>
      </div>
      <div className="text-right text-gray-900 font-medium tabular-nums">
        {formatCurrency(item.qty * item.unit_price)}
      </div>
    </div>
  </div>
)

const SummaryRow = ({
  label,
  value,
  isTotal = false,
  className = '',
}: {
  label: string
  value: string
  isTotal?: boolean
  className?: string
}) => (
  <div
    className={`flex justify-between items-center ${isTotal ? 'text-lg font-bold border-t pt-3' : 'text-sm text-gray-600'} ${className}`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const UserTypeItem = ({
  value,
  title,
  description,
  icon: Icon,
  userType,
}: {
  value: UserType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  userType: UserType
}) => (
  <Label
    htmlFor={value}
    className={clsx(
      'flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors',
      value === userType && 'border-primary bg-primary/10'
    )}
  >
    <RadioGroupItem value={value} id={value} />
    <div className="flex items-center space-x-3 flex-1">
      <div className="p-2 rounded-full bg-gray-100">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </Label>
)

export default function ParsedResults({
  data,
  onConfirm,
  onCancel,
  loading = false,
}: ParsedResultsProps) {
  const [userType, setUserType] = useState<UserType>('sharer')
  const { getDisplayText, getDisplayMerchantName } = useLanguage()

  // DRY: Centralized currency formatting using existing helper
  const formatCurrency = (amount: number) => {
    if (data.currency) {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: data.currency,
        }).format(amount)
      } catch {
        return `${data.currency} ${amount.toFixed(2)}`
      }
    }
    return `₿${amount.toFixed(2)}`
  }

  // DRY: Calculate service and tax amounts
  const serviceAmount =
    data.service_percent > 0 ? (data.subtotal * data.service_percent) / 100 : 0
  const taxAmount =
    data.tax_percent > 0 ? (data.subtotal * data.tax_percent) / 100 : 0

  return (
    <PageLayout maxWidth="3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Receipt className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Receipt Processed!
        </h1>
        <p className="text-gray-600">
          Review the details and confirm to continue
        </p>
      </div>

      <div className="space-y-8">
        {/* Merchant Info */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="text-center py-4">
            <CardTitle className="text-xl text-gray-900 mb-2">
              {getDisplayMerchantName(
                data.merchant_name,
                data.merchant_name_en
              )}
            </CardTitle>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant="outline"
                className="bg-gray-50 text-primary border-primary text-xs"
              >
                {data.items.length} item{data.items.length !== 1 ? 's' : ''}
              </Badge>
              {data.currency && (
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-700 text-xs"
                >
                  {data.currency}
                </Badge>
              )}
            </div>
            <MetadataInfo data={data} />
          </CardHeader>
        </Card>

        {/* Items */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Items Breakdown</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {data.items.map((item: ParsedItem, index: number) => (
                <ItemCard
                  key={`${item.id}-${index}`}
                  item={item}
                  formatCurrency={formatCurrency}
                  getDisplayText={getDisplayText}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(data.subtotal)}
            />

            {serviceAmount > 0 && (
              <SummaryRow
                label={`Service (${data.service_percent}%)`}
                value={formatCurrency(serviceAmount)}
              />
            )}

            {taxAmount > 0 && (
              <SummaryRow
                label={`Tax (${data.tax_percent}%)`}
                value={formatCurrency(taxAmount)}
              />
            )}

            {data.rounding !== 0 && (
              <SummaryRow
                label="Rounding"
                value={formatCurrency(data.rounding)}
              />
            )}

            <SummaryRow
              label="Total"
              value={formatCurrency(data.total)}
              isTotal={true}
              className="mt-4"
            />
          </CardContent>
        </Card>

        {/* User Type Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Who paid this bill?
          </h2>
          <RadioGroup
            value={userType}
            onValueChange={(value: UserType) => setUserType(value)}
            className="space-y-3"
          >
            <UserTypeItem
              value="payer"
              title="I paid this bill"
              description="You want to see how much others owe you"
              icon={User}
              userType={userType}
            />
            <UserTypeItem
              value="sharer"
              title="Someone else paid this bill"
              description="You want to calculate how much you owe"
              icon={Users}
              userType={userType}
            />
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            size="lg"
            className="flex-1 h-12 text-lg"
          >
            Start Over
          </Button>
          <Button
            onClick={() => onConfirm(userType)}
            disabled={loading}
            size="lg"
            className="flex-1 h-12 text-lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Continue →'
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
