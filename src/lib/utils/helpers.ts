export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function formatCurrency(
  amount: number,
  currency: string = 'THB',
  locale?: string
): string {
  // Determine locale based on currency if not provided
  const resolvedLocale = locale || getLocaleFromCurrency(currency)

  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Helper function to map currency to appropriate locale
function getLocaleFromCurrency(currency: string): string {
  const currencyToLocale: Record<string, string> = {
    THB: 'th-TH',
    USD: 'en-US',
    EUR: 'en-US', // Default to US formatting for EUR
    GBP: 'en-GB',
    JPY: 'ja-JP',
    KRW: 'ko-KR',
    CNY: 'zh-CN',
    SGD: 'en-SG',
    MYR: 'ms-MY',
    IDR: 'id-ID',
    VND: 'vi-VN',
    PHP: 'en-PH',
  }

  return currencyToLocale[currency] || 'en-US'
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
