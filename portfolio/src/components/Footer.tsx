"use client";

import { useI18n } from "@/lib/i18n";
import SheetLink from "./SheetLink";

export default function Footer() {
  const { t } = useI18n();
  const f = t.footer;

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:px-12">
        <span className="font-display text-[17px] text-ink italic">kael valen</span>
        <span>{f.copy}</span>
        <span>{f.trackers}</span>
        <span>{f.type}</span>
        <SheetLink sheet="top" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent sm:ml-auto" data-no-print>
          {t.top}
        </SheetLink>
      </div>
    </footer>
  );
}
