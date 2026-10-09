"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

type Category = "navigation" | "repositories" | "action";
type Item = {
  id: string;
  title: string;
  desc: string;
  category: Category;
  action: () => void;
};

const EMAIL = "mehmetardahakbilen2005@gmail.com";

export default function CommandPalette() {
  const { t, toggle: toggleLocale } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const p = t.palette;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const openPalette = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setSelected(0);
    setCopied(false);
    setOpen(true);
  }, []);

  const items: Item[] = useMemo(() => {
    const go = (hash: string) => () => {
      setOpen(false);
      window.location.hash = hash;
    };
    const ext = (url: string) => () => {
      setOpen(false);
      window.open(url, "_blank", "noopener,noreferrer");
    };
    const i = p.items;
    return [
      { id: "nav-research", ...i.research, category: "navigation", action: go("#research") },
      { id: "nav-projects", ...i.projects, category: "navigation", action: go("#projects") },
      { id: "nav-toolbox", ...i.toolbox, category: "navigation", action: go("#toolbox") },
      { id: "nav-contact", ...i.contact, category: "navigation", action: go("#contact") },
      { id: "repo-cerata", ...i.cerata, category: "repositories", action: ext("https://github.com/kaelvalen/cerata") },
      { id: "repo-trainscope", ...i.trainscope, category: "repositories", action: ext("https://pypi.org/project/trainscope/") },
      { id: "repo-noesis", ...i.noesis, category: "repositories", action: ext("https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md") },
      {
        id: "act-copy-email",
        ...i.email,
        category: "action",
        action: () => {
          navigator.clipboard?.writeText(EMAIL).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            },
            () => {}
          );
        },
      },
      {
        id: "act-theme",
        ...(theme === "dark" ? i.themeLight : i.themeDark),
        category: "action",
        action: () => {
          toggleTheme();
          setOpen(false);
        },
      },
      {
        id: "act-language",
        ...i.language,
        category: "action",
        action: () => {
          toggleLocale();
          setOpen(false);
        },
      },
    ];
  }, [p, theme, toggleTheme, toggleLocale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => `${it.title} ${it.desc} ${it.category}`.toLowerCase().includes(q));
  }, [items, query]);

  const active = filtered.length ? Math.min(selected, filtered.length - 1) : -1;

  // Global shortcuts: Cmd/Ctrl+K toggles, custom event opens (used by the navbar).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openPalette();
        return;
      }
      if (e.key === "/" && !open && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = e.target as HTMLElement | null;
        const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
        if (!typing) {
          e.preventDefault();
          openPalette();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", openPalette);
    };
  }, [open, close, openPalette]);

  // Focus management + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const target = returnFocus.current;
    return () => {
      document.body.style.overflow = prev;
      target?.focus?.();
    };
  }, [open]);

  // Keep the highlighted option visible when navigating with the keyboard.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`#cmd-opt-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = filtered.length;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setSelected((active + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setSelected((active - 1 + n) % n);
    } else if (e.key === "Home" && n) {
      e.preventDefault();
      setSelected(0);
    } else if (e.key === "End" && n) {
      e.preventDefault();
      setSelected(n - 1);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      filtered[active].action();
    } else if (e.key === "Tab") {
      e.preventDefault(); // keep focus on the input; options are driven by arrow keys
    }
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center bg-ink/50 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.label}
        onKeyDown={onKeyDown}
        className="animate-rise-in w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-paper font-mono shadow-card"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-muted" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-listbox"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `cmd-opt-${active}` : undefined}
            aria-label={p.label}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder={p.placeholder}
            className="w-full bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none sm:text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <span aria-live="polite" className="shrink-0 text-[10px] uppercase tracking-widest text-accent-deep">
            {copied && p.copied}
          </span>
        </div>

        <div
          ref={listRef}
          id="cmd-listbox"
          role="listbox"
          aria-label={p.commands}
          className="max-h-80 overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">{p.empty}</div>
          ) : (
            filtered.map((item, idx) => {
              const on = idx === active;
              return (
                <div
                  key={item.id}
                  id={`cmd-opt-${idx}`}
                  role="option"
                  aria-selected={on}
                  onClick={item.action}
                  onMouseMove={() => setSelected(idx)}
                  className={`flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2.5 ${
                    on ? "bg-ink text-paper" : "text-ink"
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className={`font-sans text-[11px] ${on ? "text-paper/70" : "text-muted"}`}>
                      {item.desc}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase tracking-wider ${
                      on ? "text-paper/60" : "text-muted"
                    }`}
                  >
                    {p.categories[item.category]}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-paper-dim px-4 py-2 text-[10px] text-muted">
          <span>{p.hint}</span>
          <span>{p.close}</span>
        </div>
      </div>
    </div>
  );
}
