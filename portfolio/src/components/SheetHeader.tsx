"use client";

import { useI18n } from "@/lib/i18n";
import { SHEETS, sheetNumber, type SheetId } from "@/lib/sheets";

/**
 * Title strip at the top of each sheet: sheet number, section title, then the sheet's one-line
 * statement on the B7–A6 steps of the scale. Its bottom rule is plotted as the sheet comes in.
 */
export default function SheetHeader({ id, title, heading }: { id: SheetId; title: string; heading: string }) {
  const { t } = useI18n();

  return (
    <header className="rule-draw">
      <div className="grid grid-cols-[auto_1fr] border-b border-line">
        <p className="letter-cond border-r border-line px-5 py-2.5 text-xs uppercase text-muted sm:px-8">
          {t.sheet(sheetNumber(id), SHEETS)}
        </p>
        <h2 className="letter-cond px-5 py-2.5 text-xs font-semibold uppercase text-ink sm:px-8">{title}</h2>
      </div>
      <p className="letter-wide max-w-4xl px-5 py-8 text-[clamp(var(--text-b7),3.4vw,var(--text-a6))] font-medium leading-[1.08] text-ink text-balance sm:px-8 md:py-10">
        {heading}
      </p>
    </header>
  );
}

/** The title block that closes a sheet on paper. Printed only; on screen the frame does this job. */
export function PrintTitleBlock({ id, title }: { id: SheetId; title: string }) {
  const { t } = useI18n();
  const tb = t.hero.titleBlock;
  return (
    <dl className="print-only print-keep mt-6 ml-auto w-[120mm] border border-ink text-xs text-ink">
      <div className="flex items-baseline justify-between border-b border-ink px-3 py-2">
        <dt className="sr-only">{tb.label}</dt>
        <dd className="letter-wide text-sm font-semibold">{title}</dd>
        <dd className="letter-cond uppercase text-muted">{t.sheet(sheetNumber(id), SHEETS)}</dd>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r border-line px-3 py-1.5">
          <dt className="letter-cond text-[9px] uppercase text-muted">{tb.drawn}</dt>
          <dd>M. A. Hakbilen</dd>
        </div>
        <div className="px-3 py-1.5">
          <dt className="letter-cond text-[9px] uppercase text-muted">{tb.alias}</dt>
          <dd>kaelvalen.vercel.app</dd>
        </div>
      </div>
    </dl>
  );
}
