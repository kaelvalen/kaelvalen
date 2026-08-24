"use client";

import { useEffect, useState } from "react";

const index = [
  { n: "01", label: "Research", href: "#research", id: "research" },
  { n: "02", label: "Projects", href: "#projects", id: "projects" },
  { n: "03", label: "Toolbox", href: "#toolbox", id: "toolbox" },
  { n: "04", label: "Contact", href: "#contact", id: "contact" },
];

export default function Masthead() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    index.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header>
      {/* top strip */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3 flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>M. A. Hakbilen · research notes</span>
          <span className="hidden sm:inline">Ankara, TR · 2026</span>
        </div>
      </div>

      {/* hero */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 md:pt-24 pb-16 md:pb-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted mb-6">
              ML architecture researcher
            </p>
            <h1 className="uppercase leading-[0.95] tracking-tight font-medium text-[clamp(2.7rem,7.2vw,5.4rem)]">
              Mehmet&nbsp;Arda
              <br />
              Hakbilen
            </h1>
            <p className="font-mono text-xs text-accent-deep mt-4 tracking-[0.14em]">
              ( kael valen )
            </p>

            <p className="mt-10 text-xl md:text-2xl leading-snug text-ink-soft max-w-xl">
              I study why sequence architectures are built the way they are,
              rebuilding them from scratch to test which assumptions hold outside language.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-9 flex flex-col gap-8">
            {/* red interrupt: current status */}
            <div className="bg-accent-deep text-white p-5 sm:p-6 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4 text-white/90">
                Now running
              </p>
              <p className="font-mono text-xs leading-relaxed uppercase tracking-[0.08em] font-medium text-white">
                ENGRAM: modality-portable SSD&nbsp;+&nbsp;Gated&nbsp;Delta&nbsp;Rule
                backbone
              </p>
              <p className="font-mono text-[11px] leading-relaxed mt-3 text-white/90">
                PTB-XL · Speech Commands · sCIFAR-10
                <br />
                Draft aimed at ICML 2026 ES-FoMo&nbsp;IV
              </p>
              <a
                href="https://github.com/kaelvalen/engram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-5 font-mono text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 hover:opacity-80 transition-opacity text-white font-medium"
              >
                read the repo →
              </a>
            </div>

            {/* index */}
            <nav aria-label="Index">
              {index.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.n}
                    href={item.href}
                    className={`group flex items-baseline gap-4 border-t border-line last:border-b py-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                      isActive ? "text-accent-deep font-semibold" : "hover:text-accent-deep"
                    }`}
                  >
                    <span className={isActive ? "text-accent-deep" : "text-muted group-hover:text-accent-deep"}>
                      {item.n}
                    </span>
                    <span>{item.label}</span>
                    <span className={`ml-auto transition-opacity ${isActive ? "opacity-100 text-accent-deep font-bold" : "opacity-0 group-hover:opacity-100"}`}>
                      ↓
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
