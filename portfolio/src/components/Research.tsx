"use client";

import { useI18n } from "@/lib/i18n";
import RichText from "./RichText";
import ArchitectureDiagram from "./ArchitectureDiagram";
import RelicStore from "./RelicStore";

// CounterFact paraphrase accuracy (%) from Table 4 of the RELIC paper, in the dictionary's row order.
// `mine` marks the default configuration.
const rows = [
  { acc: 89.1, mine: true },
  { acc: 80.3, mine: false },
  { acc: 66.4, mine: false },
  { acc: 62.9, mine: false },
  { acc: 10.5, mine: false },
  { acc: 2.0, mine: false },
];

const panel = "overflow-hidden rounded-[3px] border border-line bg-surface";

export default function Research() {
  const { t, locale } = useI18n();
  const r = t.research;
  const fmt = (n: number) => n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section id="research" data-sheet-id="research" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-12">
      <h2 className="max-w-[34ch] font-display text-[clamp(36px,3.6vw,48px)] leading-[1.08] tracking-[-0.02em] text-balance text-ink">{r.heading}</h2>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-16">
        <div className="max-w-[66ch] space-y-5 text-b8 leading-[1.65] text-ink-soft">
          {r.paragraphs.map((p, i) => (
            <p key={i}>
              <RichText parts={p} />
            </p>
          ))}
        </div>

        <aside>
          <h3 className="mb-4 font-display text-[21px] text-ink italic">{r.marginalia}</h3>
          <ol className="space-y-3 text-sm leading-relaxed text-ink-soft">
            {r.notes.map((note, i) => (
              <li key={note} className="grid grid-cols-[1.75rem_1fr]">
                <span className="text-muted tabular-nums">{i + 1}.</span>
                <span className="text-pretty">{note}</span>
              </li>
            ))}
          </ol>

          <h3 className="mt-10 mb-3 font-display text-[21px] text-ink italic">{r.references}</h3>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {r.links.map((l) => (
              <li key={l.href + l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="link-line break-all text-ink">{l.label}</span>
                  <span className="text-muted sm:shrink-0">{l.note}</span>
                </a>
              </li>
            ))}
          </ul>

          <figure id="table-1" className="mt-10">
            <table className="w-full text-sm">
              <caption className="mb-4 text-left text-sm text-pretty text-ink-soft">
                <span className="font-semibold text-accent">{r.benchFig}</span> {r.benchTitle}
              </caption>
              <thead>
                <tr className="border-y border-line text-left">
                  <th scope="col" className="py-2 pr-4 text-xs font-semibold text-ink">
                    {r.benchConfig}
                  </th>
                  <th scope="col" className="py-2 text-right text-xs font-semibold text-ink">
                    {r.benchAcc}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={r.benchRows[i]} className="border-b border-line align-top">
                    <td className={`py-3 pr-4 ${row.mine ? "font-semibold text-accent" : "text-ink-soft"}`}>
                      {r.benchRows[i]}
                      <span aria-hidden className="mt-2 block h-1 rounded-full bg-paper-dim">
                        <span className={`bar-draw block h-full rounded-full ${row.mine ? "bg-accent" : "bg-line-strong"}`} style={{ width: `${row.acc}%` }} />
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${row.mine ? "font-semibold text-accent" : "text-ink"}`}>{fmt(row.acc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="mt-3 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">{r.specsTitle}.</span> {r.specs}
            </figcaption>
          </figure>
        </aside>
      </div>

      <figure id="fig-1" className={`mt-16 ${panel}`}>
        <ArchitectureDiagram />
        <figcaption className="border-t border-line px-5 py-3 text-sm text-pretty text-muted sm:px-8">
          <span className="font-semibold text-accent">{r.figDiagram}</span> {r.figDiagramCaption}
        </figcaption>
      </figure>

      <div id="fig-2" className={`mt-8 ${panel}`}>
        <RelicStore />
      </div>
    </section>
  );
}
