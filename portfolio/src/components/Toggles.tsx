"use client";

import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const btn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ink cursor-pointer";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === "dark" ? t.theme.toLight : t.theme.toDark;

  return (
    <button type="button" onClick={toggle} className={btn} aria-label={label} title={label}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export function LanguageToggle() {
  const { t, toggle } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`${btn} font-mono text-[11px] font-medium tracking-wider`}
      aria-label={t.lang.switchTo}
      title={t.lang.switchTo}
    >
      {t.lang.short}
    </button>
  );
}
