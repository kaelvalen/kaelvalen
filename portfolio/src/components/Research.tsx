"use client";

import { useI18n } from "@/lib/i18n";
import Reveal from "./Reveal";
import RichText from "./RichText";
import SectionHeader from "./SectionHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";

// Accuracy values and which row is the author's own method; labels come from the dictionary.
const rows = [
  { acc: 97.46, mine: false },
  { acc: 76.77, mine: true },
  { acc: 70.58, mine: false },
  { acc: 70.34, mine: false },
  { acc: 64.94, mine: false },
  { acc: 59.3, mine: false },
];

export default function Research() {
  const { t, locale } = useI18n();
  const r = t.research;
  const fmt = (n: number) => n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 });

  return (
    <section id="research" className="py-20 md:py-28">
      <SectionHeader n="01" title={r.title} />

      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-7">
          <h3 className="mb-8 max-w-2xl font-display text-3xl leading-[1.12] tracking-tight text-balance md:text-[2.6rem]">
            {r.heading}
          </h3>

          <div className="max-w-prose space-y-5 text-[1.0625rem] leading-[1.75] text-ink-soft">
            <p><RichText parts={r.p1} /></p>
            <p><RichText parts={r.p2} /></p>
            <p><RichText parts={r.p3} /></p>
          </div>
        </Reveal>

        <Reveal className="md:col-span-5 lg:col-span-4 lg:col-start-9" delay={100}>
          <aside className="md:sticky md:top-24">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              {r.marginalia}
            </p>
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
              {r.notes.map((note) => (
                <p
                  key={note}
                  className="border-b border-line px-4 py-4 font-mono text-xs leading-relaxed text-ink-soft"
                >
                  {note}
                </p>
              ))}
              <ul className="space-y-2.5 bg-paper-dim/60 px-4 py-4 font-mono text-xs leading-relaxed">
                {r.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-line text-ink"
                    >
                      {l.label}
                    </a>
                    <span className="text-muted"> ({l.note})</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <ArchitectureDiagram />
      </Reveal>

      <Reveal className="mt-16 grid gap-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {r.benchTitle}
          </p>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
            <div className="mb-3 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              <span>{r.benchConfig}</span>
              <span>{r.benchAcc}</span>
            </div>
            <ul>
              {rows.map((row, i) => (
                <li
                  key={r.benchRows[i]}
                  className={`border-t border-line py-3 font-mono text-xs sm:text-sm ${
                    row.mine ? "text-accent-deep" : "text-ink-soft"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4 tabular-nums">
                    <span className={`min-w-0 text-pretty ${row.mine ? "font-medium" : ""}`}>
                      {r.benchRows[i]}
                    </span>
                    <span className={`shrink-0 ${row.mine ? "font-semibold" : ""}`}>{fmt(row.acc)}</span>
                  </div>
                  <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-dim">
                    <div
                      className={`h-full rounded-full ${row.mine ? "bg-accent-deep" : "bg-line-strong"}`}
                      style={{ width: `${row.acc}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="flex flex-col justify-end md:col-span-4 md:col-start-9">
          <div className="border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-muted">
            <span className="mb-1 block font-medium uppercase tracking-wider text-ink">
              {r.specsTitle}
            </span>
            {r.specs}
          </div>
        </aside>
      </Reveal>
    </section>
  );
}
