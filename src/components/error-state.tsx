import type { ErrorStateProps } from '@/types/common'

export function ErrorState({
  error,
  onRetry,
  variant = 'default',
}: ErrorStateProps) {
  const getIcon = () => {
    switch (variant) {
      case 'not-found':
        return '🔍'
      case 'access-denied':
        return '🔒'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">{getIcon()}</div>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
