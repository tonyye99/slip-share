'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

interface LanguageToggleProps {
  hasTranslation?: boolean
  merchantNameEn?: string | null
  itemsWithTranslation?: boolean
}

export function LanguageToggle({
  hasTranslation = true,
  merchantNameEn,
  itemsWithTranslation,
}: LanguageToggleProps) {
  const {
    preference,
    setPreference,
    hasTranslation: checkTranslation,
  } = useLanguage()

  const translationAvailable =
    hasTranslation ||
    checkTranslation(merchantNameEn ?? null) ||
    itemsWithTranslation

  if (!translationAvailable) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>English receipt - no translation needed</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs max-w-fit">
      <Button
        variant={preference === 'original' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setPreference('original')}
        className="h-7 px-3 text-xs"
      >
        Original
      </Button>
      <Button
        variant={preference === 'english' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setPreference('english')}
        className="h-7 px-3 text-xs"
      >
        English
      </Button>
    </div>
  )
}
