"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useActiveSheet } from "@/lib/nav";
import { SECTION_IDS } from "@/lib/sheets";
import SheetLink from "./SheetLink";
import { LanguageToggle, SkyToggle } from "./Toggles";

/** The mark for the section in view: a small disc, the site's one recurring shape. */
const Here = ({ on }: { on: boolean }) => (
  <span aria-hidden className={`inline-block size-[5px] rounded-full bg-current transition-[opacity,scale] duration-300 ${on ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
);

export default function Navbar() {
  const { t } = useI18n();
  const active = useActiveSheet();
  const [menuOpen, setMenuOpen] = useState(false);
  // Over the hero the bar is only type on the scene; past it, it takes the page's paper.
  const overScene = active === "top" && !menuOpen;

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openPalette = () => window.dispatchEvent(new Event("open-command-palette"));

  return (
    <div className="fixed inset-x-0 top-0 z-40" data-no-print>
      {/* The paper and blur sit on their own layer: a backdrop filter on the bar itself would make it
          the containing block for the fixed mobile menu, which would then shrink to the bar. Only its
          opacity transitions; its colours follow the sky with the rest of the page. */}
      <div
        aria-hidden
        className={`absolute inset-0 border-b border-line bg-paper/80 backdrop-blur-md transition-opacity duration-500 ${overScene ? "opacity-0" : "opacity-100"}`}
      />
      <div className="relative mx-auto flex h-14 max-w-[1280px] items-center px-5 sm:px-12">
        <SheetLink
          sheet="top"
          aria-current={active === "top" ? "location" : undefined}
          className="mr-auto font-display text-[21px] text-ink italic"
        >
          kael valen
        </SheetLink>

        <nav aria-label={t.nav.primary} className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {SECTION_IDS.map((id) => {
            const on = active === id;
            return (
              <SheetLink
                key={id}
                sheet={id}
                aria-current={on ? "location" : undefined}
                className={`inline-flex items-center gap-2 py-2 text-[15px] transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <Here on={on} />
                {t.nav[id]}
              </SheetLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={openPalette}
            className="hidden min-h-10 min-w-10 cursor-pointer items-center justify-center text-ink-soft transition-colors hover:text-ink md:inline-flex"
            aria-label={t.nav.openPalette}
            title={`${t.nav.search} (⌘K)`}
          >
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m12.6 12.6 4.4 4.4" />
            </svg>
          </button>
          <span className="hidden md:inline-flex">
            <LanguageToggle />
          </span>
          <SkyToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="-mr-2 inline-flex size-10 cursor-pointer items-center justify-center text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /> : <path d="M4 9h16M10 15h10" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label={t.nav.primary}
          className="animate-fade-in fixed inset-x-0 top-14 bottom-0 flex flex-col bg-paper px-5 pt-8 pb-10 md:hidden"
        >
          <ul className="space-y-1">
            {SECTION_IDS.map((id, i) => {
              const on = active === id;
              return (
                <li key={id} className="animate-rise-in" style={{ animationDelay: `${40 + i * 50}ms` }}>
                  <SheetLink
                    sheet={id}
                    onClick={() => setMenuOpen(false)}
                    aria-current={on ? "location" : undefined}
                    className={`flex items-center gap-4 py-2 font-display text-[44px] leading-tight ${on ? "text-ink" : "text-ink-soft"}`}
                  >
                    {t.nav[id]}
                    <Here on={on} />
                  </SheetLink>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openPalette();
            }}
            className="mt-6 inline-flex min-h-10 cursor-pointer items-center gap-3 self-start text-[17px] text-ink-soft"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m12.6 12.6 4.4 4.4" />
            </svg>
            {t.nav.search}
          </button>
          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <LanguageToggle large />
            <SkyToggle withLabel />
          </div>
        </nav>
      )}
    </div>
  );
}
