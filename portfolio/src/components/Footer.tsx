"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const cell = "border-line px-5 py-3 sm:px-8";
  return (
    <footer className="grid text-sm text-muted sm:grid-cols-[1fr_auto_auto_auto]">
      <span className={`${cell} border-b sm:border-b-0`}>{t.footer.copy}</span>
      <span className={`${cell} border-b sm:border-b-0 sm:border-l`}>{t.footer.trackers}</span>
      <span className={`${cell} border-b sm:border-b-0 sm:border-l`}>{t.footer.type}</span>
      <a href="#top" className={`${cell} text-ink transition-colors hover:bg-paper-dim sm:border-l`} data-no-print>
        {t.top}
      </a>
    </footer>
  );
}
