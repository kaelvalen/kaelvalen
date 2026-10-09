"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle, ThemeToggle } from "./Toggles";

const sections = ["research", "projects", "toolbox", "contact"] as const;

export default function Navbar() {
  const { t } = useI18n();
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const linkClass = (id: string) =>
    `relative px-1 py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
      active === id ? "text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <div
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled || menuOpen
          ? "border-line bg-paper/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="#top"
          className="group inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink"
          aria-label="M. A. Hakbilen"
        >
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent-deep transition-transform group-hover:rotate-45" />
          M. A. Hakbilen
        </a>

        <nav aria-label={t.nav.primary} className="hidden items-center gap-6 md:flex">
          {sections.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              className={linkClass(id)}
            >
              <span className={active === id ? "text-accent-deep" : "text-muted/70"}>0{i + 1}</span>{" "}
              {t.nav[id]}
              <span
                aria-hidden
                className={`absolute -bottom-0.5 left-1 right-1 h-px origin-left bg-accent-deep transition-transform duration-300 ${
                  active === id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="hidden h-9 items-center gap-2 rounded-md border border-line px-2.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink cursor-pointer sm:inline-flex"
            aria-label={t.nav.openPalette}
          >
            {t.nav.search}
            <kbd className="rounded border border-line px-1 text-[10px] leading-4">⌘K</kbd>
          </button>
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:text-ink cursor-pointer md:hidden"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label={t.nav.primary}
          className="animate-fade-in border-t border-line md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {sections.map((id, i) => (
              <li key={id} className="border-b border-line last:border-b-0">
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-baseline gap-4 py-3.5 font-mono text-xs uppercase tracking-[0.18em] ${
                    active === id ? "text-accent-deep" : "text-ink"
                  }`}
                >
                  <span className="text-muted">0{i + 1}</span>
                  {t.nav[id]}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new Event("open-command-palette"));
                }}
                className="flex w-full items-baseline gap-4 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-ink cursor-pointer"
              >
                <span className="text-muted">⌘</span>
                {t.nav.search}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
