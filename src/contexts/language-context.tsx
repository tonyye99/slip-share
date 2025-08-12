'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type ItemsLanguagePreference = 'original' | 'english'

interface LanguageContextType {
  preference: ItemsLanguagePreference
  setPreference: (preference: ItemsLanguagePreference) => void
  getDisplayText: (original: string | null, english: string | null) => string
  getDisplayMerchantName: (
    original: string | null,
    english: string | null
  ) => string
  hasTranslation: (english: string | null) => boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'slip-share-language-preference'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ItemsLanguagePreference>('original')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'original' || stored === 'english') {
      setPreferenceState(stored)
    }
  }, [])

  const setPreference = (newPreference: ItemsLanguagePreference) => {
    setPreferenceState(newPreference)
    localStorage.setItem(STORAGE_KEY, newPreference)
  }

  const getDisplayText = (
    original: string | null,
    english: string | null
  ): string => {
    if (preference === 'english' && english) {
      return english
    }
    return original || english || 'Unknown'
  }

  const getDisplayMerchantName = (
    original: string | null,
    english: string | null
  ): string => {
    if (preference === 'english' && english) {
      return english
    }
    return original || english || 'Unknown Merchant'
  }

  const hasTranslation = (english: string | null): boolean => {
    return english !== null && english !== undefined && english.trim() !== ''
  }

  const value = {
    preference,
    setPreference,
    getDisplayText,
    getDisplayMerchantName,
    hasTranslation,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
