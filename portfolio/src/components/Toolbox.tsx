"use client";

import { useI18n } from "@/lib/i18n";
import SheetHeader, { PrintTitleBlock } from "./SheetHeader";

export default function Toolbox() {
  const { t } = useI18n();
  const tb = t.toolbox;

  return (
    <section id="toolbox" data-sheet="4" data-sheet-id="toolbox" className="border-b border-ink">
      <SheetHeader id="toolbox" title={tb.title} heading={tb.heading} />

      <div className="grid lg:grid-cols-12">
        <dl className="lg:col-span-7 lg:border-r lg:border-line">
          {tb.groups.map((g) => (
            <div
              key={g.label}
              className="grid gap-1 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-6 sm:px-8"
            >
              <dt className="text-sm text-muted">{g.label}</dt>
              <dd className="text-a9 text-ink">{g.items}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-line px-5 py-6 text-[0.95rem] leading-relaxed text-ink-soft text-pretty sm:px-8 lg:col-span-5 lg:border-t-0">
          {tb.note}
        </p>
      </div>
      <PrintTitleBlock id="toolbox" title={tb.title} />
    </section>
  );
}
