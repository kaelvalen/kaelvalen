"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useActiveSheet } from "@/lib/nav";
import { SECTION_IDS } from "@/lib/sheets";
import SheetLink from "./SheetLink";
import { LanguageToggle, SkyToggle } from "./Toggles";

export default function Navbar() {
  const { t } = useI18n();
  const active = useActiveSheet();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const openPalette = () => window.dispatchEvent(new Event("open-command-palette"));

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md" data-no-print>
      <div className="flex h-14 items-center gap-2 px-5 sm:px-12">
        <SheetLink
          sheet="top"
          aria-current={active === "top" ? "location" : undefined}
          className="mr-auto font-display text-[21px] text-ink italic"
        >
          kael valen
        </SheetLink>

        <nav aria-label={t.nav.primary} className="hidden items-center gap-1 md:flex">
          {SECTION_IDS.map((id) => {
            const on = active === id;
            return (
              <SheetLink
                key={id}
                sheet={id}
                aria-current={on ? "location" : undefined}
                className={`px-2.5 py-1.5 text-[15px] lowercase underline-offset-[6px] transition-colors ${on ? "text-ink underline decoration-accent" : "text-muted hover:text-ink"}`}
              >
                {t.nav[id]}
              </SheetLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openPalette}
          className="hidden cursor-pointer px-2.5 py-1.5 text-[15px] text-muted lowercase transition-colors hover:text-ink sm:inline md:ml-4"
          aria-label={t.nav.openPalette}
          title="⌘K"
        >
          {t.nav.search}
        </button>
        <LanguageToggle />
        <SkyToggle />
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          className="-mr-2 inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink md:hidden"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label={t.nav.primary} className="animate-fade-in border-t border-line md:hidden">
          <ul className="px-5 py-2">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <SheetLink
                  sheet={id}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === id ? "location" : undefined}
                  className={`block py-2.5 font-display text-2xl italic ${active === id ? "text-accent" : "text-ink"}`}
                >
                  {t.nav[id]}
                </SheetLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openPalette();
                }}
                className="block w-full cursor-pointer py-2.5 text-left font-display text-2xl text-ink italic"
              >
                {t.nav.search}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
