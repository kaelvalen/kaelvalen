"use client";

import { useI18n } from "@/lib/i18n";

export const SHEETS = 5;

/** Title strip at the top of each sheet: sheet number, section title, then the sheet's one-line statement. */
export default function SheetHeader({ n, title, heading }: { n: number; title: string; heading: string }) {
  const { t } = useI18n();

  return (
    <header className="border-b border-ink">
      <div className="grid grid-cols-[auto_1fr] border-b border-line">
        <p className="letter-cond border-r border-line px-5 py-2.5 text-xs uppercase text-muted sm:px-8">
          {t.sheet(n, SHEETS)}
        </p>
        <h2 className="letter-cond px-5 py-2.5 text-xs font-semibold uppercase text-ink sm:px-8">{title}</h2>
      </div>
      <p className="letter-wide max-w-4xl px-5 py-8 text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-[1.08] text-ink text-balance sm:px-8 md:py-10">
        {heading}
      </p>
    </header>
  );
}
