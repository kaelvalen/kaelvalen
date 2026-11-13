"use client";

import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/** The sky: says whether it is Ankara's own sky or one chosen by hand, and switches to the other. */
export function SkyToggle({ className = "" }: { className?: string }) {
  const { theme, auto, toggle } = useTheme();
  const { t } = useI18n();
  const night = theme === "dark";
  const state = theme === auto ? (night ? t.sky.night : t.sky.day) : night ? t.sky.nightByHand : t.sky.dayByHand;
  const label = night ? t.sky.toDay : t.sky.toNight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${state}. ${label}`}
      title={label}
      className={`inline-flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-[14px] text-muted transition-colors hover:text-ink ${className}`}
    >
      {night ? (
        <svg key="moon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg key="sun" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
      <span className="hidden sm:inline">{state}</span>
    </button>
  );
}

export function LanguageToggle() {
  const { t, toggle } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.lang.switchTo}
      title={t.lang.switchTo}
      className="inline-flex h-8 cursor-pointer items-center px-2 text-[14px] text-muted lowercase transition-colors hover:text-ink"
    >
      {t.lang.short}
    </button>
  );
}
