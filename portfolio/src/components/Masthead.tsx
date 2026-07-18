const index = [
  { n: "01", label: "Research", href: "#research" },
  { n: "02", label: "Projects", href: "#projects" },
  { n: "03", label: "Toolbox", href: "#toolbox" },
  { n: "04", label: "Contact", href: "#contact" },
];

export default function Masthead() {
  return (
    <header>
      {/* top strip */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3 flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>M. A. Hakbilen — research notes</span>
          <span className="hidden sm:inline">Ankara, TR — 2026.07</span>
        </div>
      </div>

      {/* hero */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 md:pt-24 pb-16 md:pb-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted mb-6">
              ML architecture researcher
            </p>
            <h1 className="uppercase leading-[0.95] tracking-tight text-[clamp(2.7rem,7.2vw,5.4rem)]">
              Mehmet&nbsp;Arda
              <br />
              Hakbilen
            </h1>
            <p className="font-mono text-xs text-accent-deep mt-4 tracking-[0.14em]">
              ( kael valen )
            </p>

            <p className="mt-10 text-xl md:text-2xl leading-snug text-ink-soft max-w-xl">
              I study why modern sequence architectures are shaped the way they
              are — and rebuild them <em>from scratch</em> to find out which of
              their assumptions survive outside language.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-9 flex flex-col gap-8">
            {/* red interrupt: current status */}
            <div className="bg-accent text-white p-5 sm:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4 opacity-80">
                Now running
              </p>
              <p className="font-mono text-xs leading-relaxed uppercase tracking-[0.08em]">
                PRISM — a modality-portable SSD&nbsp;+&nbsp;Gated&nbsp;Delta&nbsp;Rule
                backbone
              </p>
              <p className="font-mono text-[11px] leading-relaxed mt-3 opacity-80">
                PTB-XL · Speech Commands · sCIFAR-10
                <br />
                Draft aimed at ICML 2026 ES-FoMo&nbsp;IV
              </p>
              <a
                href="https://github.com/kaelvalen/prism"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-5 font-mono text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 hover:opacity-75 transition-opacity"
              >
                read the repo →
              </a>
            </div>

            {/* index */}
            <nav aria-label="Index">
              {index.map((item) => (
                <a
                  key={item.n}
                  href={item.href}
                  className="group flex items-baseline gap-4 border-t border-line last:border-b py-3 font-mono text-xs uppercase tracking-[0.18em] hover:text-accent-deep transition-colors"
                >
                  <span className="text-muted group-hover:text-accent-deep transition-colors">
                    {item.n}
                  </span>
                  <span>{item.label}</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    ↓
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
