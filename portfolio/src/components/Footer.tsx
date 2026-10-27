"use client";

import { useI18n } from "@/lib/i18n";
import SheetLink from "./SheetLink";

type Revision = { letter: string; hash: string; date: string; subject: string };

const REPO = "https://github.com/kaelvalen/kaelvalen/commit/";

/** The revision block, compiled from git at build time, then the colophon. */
export default function Footer({ revisions }: { revisions: Revision[] }) {
  const { t, locale } = useI18n();
  const f = t.footer;
  const cell = "border-line px-5 py-3 sm:px-8";
  const date = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <footer>
      {revisions.length > 0 && (
        <section aria-labelledby="revisions-title" className="print-keep border-b border-ink">
          <h2 id="revisions-title" className="letter-cond border-b border-line px-5 py-2.5 text-xs font-semibold uppercase text-ink sm:px-8">
            {f.revisions}
          </h2>
          <table className="w-full text-sm">
            <thead className="sr-only">
              <tr>
                <th scope="col">{f.rev}</th>
                <th scope="col">{f.date}</th>
                <th scope="col">{f.change}</th>
                <th scope="col">{f.commit}</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((r, i) => (
                <tr key={r.hash} className="border-b border-line last:border-b-0">
                  <td className="w-16 py-2 pl-5 align-top sm:pl-8">
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center px-1 font-mono text-xs ${
                        i === 0 ? "bg-accent text-on-accent" : "border border-line-strong text-muted"
                      }`}
                    >
                      {r.letter}
                    </span>
                  </td>
                  <td className="hidden w-32 py-2 align-top text-muted tabular-nums sm:table-cell">{date(r.date)}</td>
                  <td className="py-2 pr-4 align-top text-ink-soft">{r.subject}</td>
                  <td className="w-24 py-2 pr-5 text-right align-top sm:pr-8">
                    <a
                      href={REPO + r.hash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted underline decoration-line-strong underline-offset-2 hover:text-ink"
                    >
                      {r.hash}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <div className="grid text-sm text-muted sm:grid-cols-[1fr_auto_auto_auto]">
        <span className={`${cell} border-b sm:border-b-0`}>{f.copy}</span>
        <span className={`${cell} border-b sm:border-b-0 sm:border-l`}>{f.trackers}</span>
        <span className={`${cell} border-b sm:border-b-0 sm:border-l`}>{f.type}</span>
        <SheetLink sheet="top" className={`${cell} text-ink transition-colors hover:bg-paper-dim sm:border-l`} data-no-print>
          {t.top}
        </SheetLink>
      </div>
    </footer>
  );
}
