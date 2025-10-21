"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getDictionary, type Locale, locales, defaultLocale } from "@/lib/i18n"

type I18nContextValue = {
  locale: Locale
  t: (key: string) => string
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: (k) => k,
  setLocale: () => {},
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const dict = useMemo(() => getDictionary(locale), [locale])

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Locale | null) : null
    if (stored && locales.includes(stored)) setLocaleState(stored)
  }, [])

  const setLocale = (l: Locale) => {
    if (!locales.includes(l)) return
    setLocaleState(l)
    if (typeof window !== "undefined") localStorage.setItem("lang", l)
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => dict[key] ?? key,
    }),
    [locale, dict],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
