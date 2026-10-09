"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>{t.footer}</span>
        <a href="#top" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink" data-no-print>
          {t.top} <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
