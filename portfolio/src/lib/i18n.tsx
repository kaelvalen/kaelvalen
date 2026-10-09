"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { dictionaries, type Dict, type Locale } from "./dictionary";

const KEY = "locale";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Locale {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "en" || stored === "tr") return stored;
  } catch {
    /* storage unavailable: fall through to browser language */
  }
  return navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
}

const getServerSnapshot = (): Locale => "en";

function writeLocale(next: Locale) {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

type Ctx = { locale: Locale; t: Dict; setLocale: (l: Locale) => void; toggle: () => void };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value: Ctx = {
    locale,
    t: dictionaries[locale],
    setLocale: writeLocale,
    toggle: () => writeLocale(locale === "en" ? "tr" : "en"),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
