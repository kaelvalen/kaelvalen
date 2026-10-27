"use client";

import { useI18n } from "@/lib/i18n";
import RichText from "./RichText";
import SheetHeader, { PrintTitleBlock } from "./SheetHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";
import CerataStore from "./CerataStore";
import { Dimension, GridRef, RevisionCloud } from "./Drafting";

// CounterFact paraphrase accuracy (%) from Table 4 of the Cerata paper, in the dictionary's row order.
// `mine` marks the default configuration.
const rows = [
  { acc: 89.1, mine: true },
  { acc: 80.3, mine: false },
  { acc: 66.4, mine: false },
  { acc: 62.9, mine: false },
  { acc: 10.5, mine: false },
  { acc: 2.0, mine: false },
];

export default function Research({ rev }: { rev: string }) {
  const { t, locale } = useI18n();
  const r = t.research;
  const fmt = (n: number) => n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const fig1 = (
    <figure id="fig-1" className="border-t border-ink">
      <ArchitectureDiagram />
      <figcaption className="border-t border-line px-5 py-3 text-sm text-muted text-pretty sm:px-8">
        <span className="font-semibold text-accent">{r.figDiagram}</span> <GridRef target="fig-1" className="mr-1 text-xs" /> {r.figDiagramCaption}
      </figcaption>
    </figure>
  );

  return (
    <section id="research" data-sheet="2" data-sheet-id="research" className="border-b border-ink">
      <SheetHeader id="research" title={r.title} heading={r.heading} />

      <div className="grid lg:grid-cols-12">
        <div className="px-5 py-10 sm:px-8 lg:col-span-7 lg:border-r lg:border-line">
          <Dimension>
          <div className="max-w-[66ch] space-y-5 text-b8 leading-[1.65] text-ink-soft">
            <p>
              <RichText parts={r.p1} />
            </p>
            <p>
              <RichText parts={r.p2} />
            </p>
            <p>
              <RichText parts={r.p3} />
            </p>
          </div>
          </Dimension>
        </div>

        <aside className="border-t border-line px-5 py-10 sm:px-8 lg:col-span-5 lg:border-t-0">
          <h3 className="letter-cond mb-4 text-xs font-semibold uppercase text-ink">{r.marginalia}</h3>
          <ol className="space-y-3 text-sm leading-relaxed text-ink-soft">
            {r.notes.map((note, i) => (
              <li key={note} className="grid grid-cols-[1.75rem_1fr]">
                <span className="tabular-nums text-muted">{i + 1}.</span>
                <span className="text-pretty">{note}</span>
              </li>
            ))}
          </ol>

          <h3 className="letter-cond mt-10 mb-4 text-xs font-semibold uppercase text-ink">{r.references}</h3>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {r.links.map((l) => (
              <li key={l.href + l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 py-2.5 transition-colors hover:bg-paper-dim sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="link-line break-all text-ink">{l.label}</span>
                  <span className="text-muted sm:shrink-0">{l.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {rev ? (
        <RevisionCloud rev={rev} label={r.revised(rev)} className="m-4">
          {fig1}
        </RevisionCloud>
      ) : (
        fig1
      )}

      <div className="grid border-t border-ink lg:grid-cols-12">
        <div id="fig-2" className="lg:col-span-7 lg:border-r lg:border-ink">
          <CerataStore />
        </div>

        <figure id="table-1" className="flex flex-col border-t border-ink lg:col-span-5 lg:border-t-0">
          <div className="flex-1 px-5 py-8 sm:px-8">
            <table className="w-full text-sm">
              <caption className="mb-4 text-left text-sm text-ink-soft text-pretty">
                <span className="font-semibold text-accent">{r.benchFig}</span> <GridRef target="table-1" className="mr-1 text-xs text-muted" /> {r.benchTitle}
              </caption>
              <thead>
                <tr className="border-y border-ink text-left">
                  <th scope="col" className="letter-cond py-2 pr-4 text-xs font-semibold uppercase text-ink">
                    {r.benchConfig}
                  </th>
                  <th scope="col" className="letter-cond py-2 text-right text-xs font-semibold uppercase text-ink">
                    {r.benchAcc}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={r.benchRows[i]} className="border-b border-line align-top">
                    <td className={`py-3 pr-4 ${row.mine ? "font-semibold text-accent" : "text-ink-soft"}`}>
                      {r.benchRows[i]}
                      <span aria-hidden className="mt-2 block h-1 bg-paper-dim">
                        <span className={`bar-draw block h-full ${row.mine ? "bg-accent" : "bg-line-strong"}`} style={{ width: `${row.acc}%` }} />
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${row.mine ? "font-semibold text-accent" : "text-ink"}`}>{fmt(row.acc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="border-t border-line px-5 py-3 text-sm leading-relaxed text-muted sm:px-8">
            <span className="font-semibold text-ink">{r.specsTitle}.</span> {r.specs}
          </figcaption>
        </figure>
      </div>
      <PrintTitleBlock id="research" title={r.title} />
    </section>
  );
}
