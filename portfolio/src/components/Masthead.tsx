"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SHEETS } from "@/lib/sheets";
import TensorName, { HEADS, type Readouts } from "./TensorName";
import { Dimension, GridRef } from "./Drafting";
import { PrintTitleBlock } from "./SheetHeader";
import SheetLink from "./SheetLink";

const PYPI = "https://pypi.org/project/trainscope/";

// Each hero note cites the figure that backs it.
const NOTE_REFS = ["fig-1", "fig-1", "fig-1", "table-1"];

type Revision = { letter: string; hash: string; date: string } | null;

export default function Masthead({ revision }: { revision: Revision }) {
  const { t, locale } = useI18n();
  const h = t.hero;
  const tb = h.titleBlock;

  const [keys, setKeys] = useState(0);
  const [copied, setCopied] = useState(false);
  const query = useRef<HTMLElement>(null);
  const peak1 = useRef<HTMLElement>(null);
  const peak2 = useRef<HTMLElement>(null);
  const readouts: Readouts = useMemo(() => ({ query, peak1, peak2 }), []);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  const onKeys = useCallback((n: number) => setKeys(n), []);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(h.install);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the command stays visible to copy by hand */
    }
  };

  const tag = locale === "tr" ? "tr-TR" : "en-GB";
  const revisionValue = revision
    ? `${revision.letter} · ${new Date(`${revision.date}T12:00:00Z`).toLocaleDateString(tag, { month: "short", year: "numeric" })}`
    : tb.revisionValue;

  const cell = "border-line px-5 py-3 sm:px-6";
  const cellLabel = "letter-cond block text-[11px] uppercase text-muted";

  return (
    <header id="top" data-sheet="1" data-sheet-id="top" className="border-b border-ink">
      <figure className="drafting-grid border-b border-ink">
        <figcaption className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="text-sm text-ink-soft">
            <span className="font-semibold text-accent">{h.fig}</span>{" "}
            <h1 className="inline font-semibold text-ink">{h.name}</h1> <span className="text-muted">({h.alias})</span>
            <span className="block text-muted sm:inline">
              <span className="hidden sm:inline">, </span>
              {h.figCaption(keys ? keys.toLocaleString(locale === "tr" ? "tr-TR" : "en-US") : "…")}
            </span>
          </div>
          <dl className="hidden shrink-0 grid-cols-[auto_auto_auto] gap-x-4 font-mono text-xs leading-relaxed text-muted sm:grid" data-no-print>
            <dt>{h.query}</dt>
            <dd ref={query} className="col-span-2 text-right text-ink">
              0.30, 0.50
            </dd>
            <dt>{h.temperature}</dt>
            <dd className="text-right text-accent">τ₁ = {HEADS[0].tau}</dd>
            <dd className="text-right text-ink">τ₂ = {HEADS[1].tau}</dd>
            <dt>{h.peak}</dt>
            <dd ref={peak1} className="text-right text-accent">
              –
            </dd>
            <dd ref={peak2} className="text-right text-ink">
              –
            </dd>
          </dl>
        </figcaption>

        <TensorName text="HAKBILEN" onKeys={onKeys} readouts={readouts} />

        <div className="px-5 pb-6 sm:px-8">
          <p className="dim-line letter-cond text-xs uppercase text-ink">
            <span>{h.role}</span>
          </p>
        </div>
      </figure>

      <div className="grid lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-10 border-b border-ink px-5 py-10 sm:px-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:py-12">
          <Dimension>
            <p className="max-w-[36ch] text-[clamp(var(--text-b7),2.5vw,var(--text-b6))] leading-[1.22] text-ink text-pretty">{h.lead}</p>
          </Dimension>

          <div className="flex flex-wrap items-stretch gap-3" data-no-print>
            <SheetLink
              sheet="research"
              className="press inline-flex items-center bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85"
            >
              {h.ctaPrimary}
            </SheetLink>
            <button
              type="button"
              onClick={copyInstall}
              aria-label={h.installLabel}
              className="inline-flex cursor-pointer items-center gap-3 border border-ink px-4 py-3 font-mono text-[13px] text-ink transition-colors hover:bg-paper-dim"
            >
              <span aria-hidden className="text-muted">
                $
              </span>
              {h.install}
              <span aria-live="polite" className="letter-cond font-sans text-xs uppercase text-accent">
                {copied ? h.installCopied : ""}
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:col-span-5">
          <div className="flex-1 px-5 py-8 sm:px-8">
            <h2 className="letter-cond mb-4 text-xs font-semibold uppercase text-ink">{h.notesTitle}</h2>
            <ol className="space-y-2.5 text-a9 leading-snug text-ink-soft">
              {h.notes.map((note, i) => (
                <li key={note} className="grid grid-cols-[1.75rem_1fr]">
                  <span className="tabular-nums text-muted">{i + 1}.</span>
                  <span className="text-pretty">
                    {note} <GridRef target={NOTE_REFS[i]} className="text-xs text-muted" />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <dl aria-label={tb.label} className="grid grid-cols-2 border-t border-ink text-sm text-ink">
            <div className={`${cell} col-span-2 flex items-baseline justify-between gap-4 border-b`}>
              <dt className="sr-only">{tb.label}</dt>
              <dd className="letter-wide text-base font-semibold">{tb.title}</dd>
              <dd className="letter-cond text-xs uppercase text-muted">
                {tb.sheet} 1 / {SHEETS}
              </dd>
            </div>
            <div className={`${cell} border-r border-b`}>
              <dt className={cellLabel}>{tb.drawn}</dt>
              <dd>M. A. Hakbilen</dd>
            </div>
            <div className={`${cell} border-b`}>
              <dt className={cellLabel}>{tb.alias}</dt>
              <dd>{h.alias}</dd>
            </div>
            <div className={`${cell} border-r border-b`}>
              <dt className={cellLabel}>{tb.based}</dt>
              <dd>{tb.basedValue}</dd>
            </div>
            <div className={`${cell} border-b`}>
              <dt className={cellLabel}>{tb.hardware}</dt>
              <dd>{tb.hardwareValue}</dd>
            </div>
            <div className={`${cell} border-r`}>
              <dt className={cellLabel}>{tb.current}</dt>
              <dd>
                <a href={PYPI} target="_blank" rel="noopener noreferrer" className="link-line">
                  {tb.currentValue}
                </a>
              </dd>
            </div>
            <div className={cell}>
              <dt className={cellLabel}>{tb.revision}</dt>
              <dd>
                {revisionValue}
                {revision && <span className="ml-2 font-mono text-xs text-muted">{revision.hash}</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <PrintTitleBlock id="top" title={tb.title} />
    </header>
  );
}
