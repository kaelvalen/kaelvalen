"use client";

import { useI18n } from "@/lib/i18n";
import RichText from "./RichText";
import SheetHeader from "./SheetHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";
import CerataStore from "./CerataStore";

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

export default function Research() {
  const { t, locale } = useI18n();
  const r = t.research;
  const fmt = (n: number) => n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section id="research" className="border-b border-ink">
      <SheetHeader n={2} title={r.title} heading={r.heading} />

      <div className="grid lg:grid-cols-12">
        <div className="space-y-5 px-5 py-10 text-[1.0625rem] leading-[1.7] text-ink-soft sm:px-8 lg:col-span-7 lg:border-r lg:border-line">
          <p className="max-w-[66ch]"><RichText parts={r.p1} /></p>
          <p className="max-w-[66ch]"><RichText parts={r.p2} /></p>
          <p className="max-w-[66ch]"><RichText parts={r.p3} /></p>
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
                  className="flex items-baseline justify-between gap-4 py-2.5 transition-colors hover:bg-paper-dim"
                >
                  <span className="link-line text-ink">{l.label}</span>
                  <span className="shrink-0 text-muted">{l.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <figure className="border-t border-ink">
        <ArchitectureDiagram />
        <figcaption className="border-t border-line px-5 py-3 text-sm text-muted text-pretty sm:px-8">
          <span className="font-semibold text-accent">{r.figDiagram}</span> {r.figDiagramCaption}
        </figcaption>
      </figure>

      <div className="grid border-t border-ink lg:grid-cols-12">
        <div className="lg:col-span-7 lg:border-r lg:border-ink">
          <CerataStore />
        </div>

        <figure className="flex flex-col border-t border-ink lg:col-span-5 lg:border-t-0">
          <div className="flex-1 px-5 py-8 sm:px-8">
            <table className="w-full text-sm">
              <caption className="mb-4 text-left text-sm text-ink-soft text-pretty">
                <span className="font-semibold text-accent">{r.benchFig}</span> {r.benchTitle}
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
                        <span
                          className={`block h-full ${row.mine ? "bg-accent" : "bg-line-strong"}`}
                          style={{ width: `${row.acc}%` }}
                        />
                      </span>
                    </td>
                    <td className={`py-3 text-right tabular-nums ${row.mine ? "font-semibold text-accent" : "text-ink"}`}>
                      {fmt(row.acc)}
                    </td>
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
    </section>
  );
}
