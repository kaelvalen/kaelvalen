"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

type Cat = "ml" | "systems" | "apps";
type Filter = "all" | Cat;

type Project = {
  name: string;
  stack: string;
  status: "active" | "PyPI" | "crates.io" | "public" | "superseded" | "archived";
  href: string;
  cat: Cat;
};

const projects: Project[] = [
  { name: "cerata", stack: "PyTorch", status: "active", href: "https://github.com/kaelvalen/cerata", cat: "ml" },
  { name: "trainscope", stack: "FastAPI · React", status: "PyPI", href: "https://pypi.org/project/trainscope/", cat: "ml" },
  { name: "latch-lang", stack: "Rust", status: "crates.io", href: "https://github.com/kaelvalen/latch-lang", cat: "systems" },
  { name: "connor", stack: "Rust", status: "public", href: "https://github.com/kaelvalen/connor", cat: "systems" },
  { name: "weave", stack: "Tauri · React · Rust", status: "active", href: "https://github.com/kaelvalen/weave", cat: "apps" },
  { name: "beyond_transformer", stack: "PyTorch", status: "superseded", href: "https://github.com/kaelvalen/beyond_transformer", cat: "ml" },
  { name: "nanonet", stack: "Go · Rust · TS", status: "archived", href: "https://github.com/kaelvalen/nanonet", cat: "systems" },
];

const filterOrder: Filter[] = ["all", "ml", "systems", "apps"];

export default function Projects() {
  const { t } = useI18n();
  const p = t.projects;
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) => (f === "all" ? projects.length : projects.filter((x) => x.cat === f).length);
  const filtered = filter === "all" ? projects : projects.filter((x) => x.cat === filter);

  return (
    <section id="projects" className="border-t border-line py-20 md:py-28">
      <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 lg:flex-row lg:items-center">
        <SectionHeader n="02" title={p.title} className="mb-0 lg:flex-1" />

        <div role="group" aria-label={p.filterLabel} className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {filterOrder.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={on}
                className={`cursor-pointer rounded-full border px-3 py-1.5 transition-colors ${
                  on
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-transparent text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {p.filters[f]} <span className={on ? "opacity-70" : "opacity-60"}>({count(f)})</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {p.shown(filtered.length, projects.length)}
      </p>

      <Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((proj, i) => (
            <li key={proj.name} className="animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
              <a
                href={proj.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-card sm:p-6"
              >
                <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 normal-case tracking-normal">
                    {proj.status === "active" && (
                      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent-deep" />
                    )}
                    {p.status[proj.status]}
                  </span>
                </div>

                <h3 className="mt-6 font-mono text-lg font-medium tracking-tight text-ink">{proj.name}</h3>
                <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-soft text-pretty">
                  {p.blurbs[proj.name]}
                </p>

                <div className="mt-6 flex items-end justify-between gap-3 border-t border-line pt-4 font-mono text-xs">
                  <span className="text-muted">{proj.stack}</span>
                  <span
                    aria-hidden
                    className="text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-deep"
                  >
                    ↗
                  </span>
                  <span className="sr-only">({p.open})</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <p className="mt-8 font-mono text-xs leading-relaxed text-muted">
        {p.footnote}{" "}
        <a href="https://github.com/kaelvalen" target="_blank" rel="noopener noreferrer" className="link-line">
          github
        </a>
        .
      </p>
    </section>
  );
}
