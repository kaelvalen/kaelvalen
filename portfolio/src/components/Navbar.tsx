"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle, ThemeToggle } from "./Toggles";

// Section ids in page order; the hero is sheet 1, so these are sheets 2 to 5.
const sections = ["research", "projects", "toolbox", "contact"] as const;

export default function Navbar() {
  const { t } = useI18n();
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const openPalette = () => window.dispatchEvent(new Event("open-command-palette"));

  return (
    <div className="sticky top-0 z-40 border-b border-ink bg-paper">
      <div className="flex h-12 items-stretch">
        <a
          href="#top"
          className="letter-wide flex items-center border-r border-ink px-5 text-sm font-semibold text-ink sm:px-8"
        >
          M. A. Hakbilen
        </a>

        <nav aria-label={t.nav.primary} className="hidden flex-1 items-stretch md:flex">
          {sections.map((id, i) => {
            const on = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={on ? "location" : undefined}
                className={`flex items-center gap-2 border-r border-line px-5 text-sm transition-colors ${
                  on ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                }`}
              >
                <span className={`text-xs tabular-nums ${on ? "text-paper/70" : "text-muted"}`}>{i + 2}</span>
                {t.nav[id]}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-stretch md:ml-0">
          <button
            type="button"
            onClick={openPalette}
            className="hidden cursor-pointer items-center gap-3 border-l border-ink px-4 text-sm text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink sm:inline-flex"
            aria-label={t.nav.openPalette}
          >
            {t.nav.search}
            <kbd className="border border-line-strong px-1.5 font-mono text-[11px] leading-5 text-muted">⌘K</kbd>
          </button>
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex w-12 cursor-pointer items-center justify-center border-l border-ink text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label={t.nav.primary} className="animate-fade-in border-t border-ink md:hidden">
          <ul>
            {sections.map((id, i) => (
              <li key={id} className="border-b border-line">
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === id ? "location" : undefined}
                  className={`flex items-baseline gap-4 px-5 py-3.5 text-base ${active === id ? "bg-ink text-paper" : "text-ink"}`}
                >
                  <span className="w-4 text-sm tabular-nums text-muted">{i + 2}</span>
                  {t.nav[id]}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openPalette();
                }}
                className="flex w-full cursor-pointer items-baseline gap-4 px-5 py-3.5 text-base text-ink"
              >
                <span className="w-4 text-sm text-muted">⌘</span>
                {t.nav.search}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
