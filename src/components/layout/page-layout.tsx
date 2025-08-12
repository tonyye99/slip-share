import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  padding?: 'sm' | 'md' | 'lg'
}

export function PageLayout({
  children,
  className,
  maxWidth = '3xl',
  padding = 'md',
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }

  const paddingClasses = {
    sm: 'px-4 py-4',
    md: 'px-4 py-6 sm:py-8',
    lg: 'px-6 py-8 sm:py-12',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
