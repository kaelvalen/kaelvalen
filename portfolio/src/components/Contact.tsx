"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const EMAIL = "mehmetardahakbilen2005@gmail.com";

const links = [
  { label: "github", href: "https://github.com/kaelvalen" },
  { label: "linkedin", href: "https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/" },
  { label: "pypi", href: "https://pypi.org/project/trainscope/" },
];

export default function Contact() {
  const { t } = useI18n();
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
    <section id="contact" className="border-t border-line py-20 md:py-28">
      <SectionHeader n="04" title={t.contact.title} />

      <Reveal className="max-w-4xl">
        <p className="font-display text-3xl leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
          {t.contact.lead}{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="break-normal text-accent-deep underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-colors hover:decoration-accent"
          >
            mehmetardahakbilen2005@<wbr />gmail.com
          </a>
        </p>

        <div className="mt-6 flex min-h-9 items-center gap-3">
          <button
            type="button"
            onClick={copy}
            aria-label={t.contact.copyLabel}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
            {copied ? t.contact.copied : t.contact.copy}
          </button>
          <span aria-live="polite" className="font-mono text-xs text-accent-deep">
            {copied && <span className="animate-fade-in">✓ {t.contact.copiedMsg}</span>}
          </span>
        </div>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft text-pretty">
          {t.contact.body}
        </p>

        <ul className="mt-10 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
              >
                {l.label}
                <span aria-hidden className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-deep">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
