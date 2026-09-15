import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nContext, LOCALE_STORAGE_KEY, detectLocale, makeTranslator, type Locale } from ".";

/**
 * Holds the chosen locale, persists it, and keeps `<html lang>` in step so the
 * browser hyphenates and spell-checks in the right language.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // A locale we cannot persist still applies for this visit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ ...makeTranslator(locale), setLocale }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
