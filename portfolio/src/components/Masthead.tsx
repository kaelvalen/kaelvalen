"use client";

import { useI18n } from "@/lib/i18n";

export default function Masthead() {
  const { t } = useI18n();
  const h = t.hero;

  return (
    <header id="top" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="animate-rise-in lg:col-span-7">
            <p className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 py-1.5 pl-3 pr-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted backdrop-blur-sm">
              <span aria-hidden className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-deep" />
              {h.eyebrow}
              <span className="hidden items-center gap-2.5 sm:inline-flex">
                <span aria-hidden className="text-line-strong">/</span>
                {h.location}
              </span>
            </p>

            <h1 className="font-display text-[clamp(3.4rem,9.5vw,7.4rem)] font-normal leading-[0.92] tracking-[-0.02em] text-ink">
              {h.firstName}
              <br />
              <span className="italic text-accent-deep">{h.lastName}</span>
            </h1>
            <p className="mt-4 font-mono text-xs tracking-[0.14em] text-muted">{h.alias}</p>

            <p className="mt-9 max-w-xl text-xl leading-[1.5] text-ink-soft text-pretty md:text-[1.4rem]">
              {h.lead}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#research"
                className="group inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85"
              >
                {h.ctaPrimary}
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-md border border-line-strong px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                {h.ctaSecondary}
              </a>
            </div>
          </div>

          <aside
            className="animate-rise-in lg:col-span-5 lg:pt-14"
            style={{ animationDelay: "120ms" }}
            aria-label={h.status.label}
          >
            <div className="rounded-[var(--radius-card)] bg-accent-deep p-6 text-on-accent shadow-card sm:p-7">
              <p className="mb-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em]">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-on-accent" />
                {h.status.label}
              </p>
              <p className="font-display text-[1.9rem] leading-[1.1]">{h.status.title}</p>
              <ul className="mt-5 space-y-1.5 font-mono text-xs leading-relaxed opacity-90">
                {h.status.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <a
                href="https://pypi.org/project/trainscope/"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-on-accent mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                {h.status.cta} <span aria-hidden>→</span>
              </a>
            </div>
          </aside>
        </div>

        <dl
          aria-label={h.metricsLabel}
          className="animate-rise-in mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:mt-20 lg:grid-cols-4"
          style={{ animationDelay: "220ms" }}
        >
          {h.metrics.map((m) => (
            <div key={m.label} className="bg-surface p-5 sm:p-6">
              <dd className="font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                {m.value}
              </dd>
              <dt className="mt-3 text-[13px] leading-snug text-muted text-pretty">{m.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
