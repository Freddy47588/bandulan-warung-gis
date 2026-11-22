import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MESSAGES, type Locale, type MessageKey } from "./messages";

const STORAGE_KEY = "bandulan-v2-lang";

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, maxFractionDigits?: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveInitialLocale(): Locale {
  try {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang === "en" || urlLang === "id") return urlLang;
  } catch {
    // ignore URL errors
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // ignore storage errors
  }

  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => {
      const entry = MESSAGES[key];
      const template: string = entry ? entry[locale] : key;
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] !== undefined ? String(params[name]) : match,
      );
    },
    [locale],
  );

  const formatNumber = useCallback(
    (value: number, maxFractionDigits = 2) =>
      new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
        maximumFractionDigits: maxFractionDigits,
      }).format(value),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatNumber }),
    [locale, setLocale, t, formatNumber],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
