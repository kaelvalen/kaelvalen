"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import SheetHeader, { PrintTitleBlock } from "./SheetHeader";
import { Dimension } from "./Drafting";

const EMAIL = "mehmetardahakbilen2005@gmail.com";

const links = [
  { label: "GitHub", handle: "kaelvalen", href: "https://github.com/kaelvalen" },
  { label: "LinkedIn", handle: "mehmet-arda-hakbilen", href: "https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/" },
  { label: "PyPI", handle: "trainscope", href: "https://pypi.org/project/trainscope/" },
];

export default function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  return (
    <section id="contact" data-sheet="5" data-sheet-id="contact" className="border-b border-ink">
      <SheetHeader id="contact" title={c.title} heading={c.heading} />

      <div className="grid lg:grid-cols-12">
        <div className="px-5 py-10 sm:px-8 lg:col-span-7 lg:border-r lg:border-line">
          <p className="text-sm text-muted">{c.lead}</p>
          <a
            href={`mailto:${EMAIL}`}
            className="letter-wide mt-2 block break-words text-[clamp(var(--text-a8),3.2vw,var(--text-b6))] font-medium leading-tight text-ink underline decoration-line-strong decoration-1 underline-offset-[0.18em] transition-colors hover:decoration-accent"
          >
            mehmetardahakbilen2005@<wbr />gmail.com
          </a>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={copy}
              aria-label={c.copyLabel}
              className="inline-flex cursor-pointer items-center gap-2 border border-ink px-4 py-2.5 text-sm text-ink transition-colors hover:bg-paper-dim"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="9" y="9" width="11" height="11" />
                <path d="M5 15V4h11" />
              </svg>
              {copied ? c.copied : c.copy}
            </button>
            <span aria-live="polite" className="text-sm text-ok">
              {copied && c.copiedMsg}
            </span>
          </div>

          <Dimension className="mt-10">
            <p className="max-w-[48ch] text-b8 text-ink-soft text-pretty">{c.body}</p>
          </Dimension>
        </div>

        <div className="border-t border-line lg:col-span-5 lg:border-t-0">
          <h3 className="letter-cond border-b border-line px-5 py-2.5 text-xs font-semibold uppercase text-ink sm:px-8">
            {c.elsewhere}
          </h3>
          <ul>
            {links.map((l) => (
              <li key={l.label} className="border-b border-line last:border-b-0">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[7rem_1fr] items-baseline px-5 py-4 transition-colors hover:bg-paper-dim sm:px-8"
                >
                  <span className="text-sm text-muted">{l.label}</span>
                  <span className="font-mono text-[15px] text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
                    {l.handle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <PrintTitleBlock id="contact" title={c.title} />
    </section>
  );
}
