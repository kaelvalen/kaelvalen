"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import SheetHeader, { PrintTitleBlock } from "./SheetHeader";

type Cat = "ml" | "systems" | "apps";
type Filter = "all" | Cat;

type Project = {
  name: string;
  stack: string;
  status: "active" | "PyPI" | "crates.io" | "public" | "superseded" | "archived";
  href: string;
  cat: Cat;
};

// Order is the parts-list order; an item keeps its number when the list is filtered.
const projects: Project[] = [
  { name: "relic", stack: "PyTorch, PEFT", status: "active", href: "https://github.com/kaelvalen/relic", cat: "ml" },
  { name: "trainscope", stack: "FastAPI, React", status: "PyPI", href: "https://pypi.org/project/trainscope/", cat: "ml" },
  { name: "latch-lang", stack: "Rust", status: "crates.io", href: "https://github.com/kaelvalen/latch-lang", cat: "systems" },
  { name: "connor", stack: "Rust", status: "public", href: "https://github.com/kaelvalen/connor", cat: "systems" },
  { name: "weave", stack: "Tauri, React, Rust", status: "active", href: "https://github.com/kaelvalen/weave", cat: "apps" },
  { name: "beyond_transformer", stack: "PyTorch", status: "superseded", href: "https://github.com/kaelvalen/beyond_transformer", cat: "ml" },
  { name: "nanonet", stack: "Go, Rust, TypeScript", status: "archived", href: "https://github.com/kaelvalen/nanonet", cat: "systems" },
];

const filterOrder: Filter[] = ["all", "ml", "systems", "apps"];
const row = "md:grid-cols-[4rem_minmax(9rem,13rem)_1fr_minmax(8rem,12rem)_7rem]";

export default function Projects() {
  const { t } = useI18n();
  const p = t.projects;
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) => (f === "all" ? projects.length : projects.filter((x) => x.cat === f).length);
  const shown = projects.map((proj, i) => ({ proj, item: i + 1 })).filter(({ proj }) => filter === "all" || proj.cat === filter);

  return (
    <section id="projects" data-sheet="3" data-sheet-id="projects" className="border-b border-ink">
      <SheetHeader id="projects" title={p.title} heading={p.heading} />

      <div role="group" aria-label={p.filterLabel} className="flex flex-wrap border-b border-line">
        {filterOrder.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={on}
              className={`cursor-pointer border-r border-line px-5 py-2.5 text-sm transition-colors sm:px-6 ${
                on ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              }`}
            >
              {p.filters[f]} <span className={`tabular-nums ${on ? "text-paper/70" : "text-muted"}`}>{count(f)}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {p.shown(shown.length, projects.length)}
      </p>

      <div aria-hidden className={`${row} letter-cond hidden border-b border-ink text-xs font-semibold uppercase text-ink md:grid`}>
        <span className="border-r border-line px-4 py-2">{p.columns.item}</span>
        <span className="border-r border-line px-4 py-2">{p.columns.part}</span>
        <span className="border-r border-line px-4 py-2">{p.columns.description}</span>
        <span className="border-r border-line px-4 py-2">{p.columns.stack}</span>
        <span className="px-4 py-2">{p.columns.status}</span>
      </div>

      <ul>
        {shown.map(({ proj, item }) => (
          <li key={proj.name} className="border-b border-line last:border-b-0">
            <a
              href={proj.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${row} group grid grid-cols-[3rem_1fr] gap-y-1 px-5 py-4 transition-colors hover:bg-paper-dim sm:px-8 md:gap-y-0 md:px-0 md:py-0`}
            >
              <span className="row-span-4 text-sm tabular-nums text-muted md:row-span-1 md:border-r md:border-line md:px-4 md:py-4">
                {String(item).padStart(2, "0")}
              </span>
              <span className="font-mono text-[15px] font-medium text-ink md:border-r md:border-line md:px-4 md:py-4">
                <span className="group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{proj.name}</span>
                <span className="sr-only"> ({p.open})</span>
              </span>
              <span className="text-[0.95rem] leading-snug text-ink-soft text-pretty md:border-r md:border-line md:px-4 md:py-4">
                {p.blurbs[proj.name]}
              </span>
              <span className="text-sm text-muted md:border-r md:border-line md:px-4 md:py-4">{proj.stack}</span>
              <span
                className={`text-sm md:px-4 md:py-4 ${proj.status === "active" ? "font-semibold text-accent" : "text-muted"}`}
              >
                {p.status[proj.status]}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="border-t border-ink px-5 py-3 text-sm text-muted sm:px-8">
        {p.footnote}{" "}
        <a href="https://github.com/kaelvalen" target="_blank" rel="noopener noreferrer" className="link-line text-ink">
          GitHub
        </a>
        .
      </p>
      <PrintTitleBlock id="projects" title={p.title} />
    </section>
  );
}
