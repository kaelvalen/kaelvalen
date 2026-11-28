"use client";

import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/** The sky as the hero draws it: by night a ringed hole, by day the same hole in dots of ink. */
function SkyGlyph({ night }: { night: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden className="shrink-0">
      {night ? (
        <>
          <ellipse cx="10" cy="10.6" rx="8.6" ry="2.6" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
          <circle cx="10" cy="10" r="4.1" fill="currentColor" />
          <path d="M1.4 10.6a8.6 2.6 0 0 0 17.2 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </>
      ) : (
        <>
          <ellipse cx="10" cy="10.6" rx="8.6" ry="2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="0.01 2.3" strokeLinecap="round" />
          <circle cx="10" cy="10" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="0.01 2.15" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** The sky: says whether it is Ankara's own sky or one chosen by hand, and switches to the other. */
export function SkyToggle({ withLabel = false }: { withLabel?: boolean }) {
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
      title={`${state}. ${label}`}
      className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-2.5 text-[15px] text-ink-soft transition-colors hover:text-ink"
    >
      <SkyGlyph night={night} />
      {withLabel && <span className="first-letter:uppercase">{state}</span>}
    </button>
  );
}

/** Both languages, the current one in ink; one press switches. */
export function LanguageToggle({ large = false }: { large?: boolean }) {
  const { t, locale, toggle } = useI18n();
  const item = (l: "en" | "tr") => (
    <span className={`transition-colors ${locale === l ? "text-ink" : "text-muted group-hover:text-ink-soft"}`}>{l.toUpperCase()}</span>
  );
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.lang.switchTo}
      title={t.lang.switchTo}
      className={`group inline-flex min-h-10 cursor-pointer items-center gap-1.5 tracking-[0.04em] ${large ? "text-[17px]" : "text-[13px]"}`}
    >
      {item("en")}
      <span aria-hidden className="text-line-strong">/</span>
      {item("tr")}
    </button>
  );
}
