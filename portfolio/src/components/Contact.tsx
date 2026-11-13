"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

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

  // At least a screen tall with the footer, so /contact can open with the section at the top.
  return (
    <section id="contact" data-sheet-id="contact" className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-[1280px] flex-col justify-center px-5 py-20 sm:px-12 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:gap-16">
        <div>
          <h2 className="font-display text-[clamp(36px,3.6vw,48px)] leading-none tracking-[-0.02em] text-ink">{c.heading}</h2>
          <p className="mt-5 max-w-[48ch] text-b8 text-pretty text-ink-soft">{c.body}</p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-10 block font-display text-[clamp(24px,2.8vw,40px)] leading-tight break-words text-ink underline decoration-line-strong decoration-1 underline-offset-[0.18em] transition-colors hover:decoration-accent"
          >
            mehmetardahakbilen2005@<wbr />gmail.com
          </a>
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={copy}
              aria-label={c.copyLabel}
              className="cursor-pointer text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
            >
              {copied ? c.copied : c.copy}
            </button>
            <span aria-live="polite" className="text-sm text-ok">
              {copied && c.copiedMsg}
            </span>
          </div>
        </div>

        <div className="lg:pt-3">
          <h3 className="mb-3 font-display text-[21px] text-ink italic">{c.elsewhere}</h3>
          <ul className="divide-y divide-line border-y border-line">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[6.5rem_1fr] items-baseline py-4"
                >
                  <span className="text-sm text-muted">{l.label}</span>
                  <span className="font-mono text-[15px] text-ink group-hover:text-accent">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
