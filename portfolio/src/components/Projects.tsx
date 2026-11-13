"use client";

import { useI18n } from "@/lib/i18n";
import { basinsFor, slice, surface, type BasinId } from "@/lib/landscape";
import { BASIN_NAMES } from "./Hero";

type Status = "active" | "PyPI" | "crates.io" | "public" | "closed" | "superseded" | "archived";
type Project = { name: string; stack: string; status: Status; href: string; since?: string };

// The projects that are basins on the map, in reading order.
const onMap: (Project & { id: BasinId })[] = [
  { id: "relic", name: "relic", since: "2026-10", stack: "PyTorch, PEFT", status: "active", href: "https://github.com/kaelvalen/relic" },
  { id: "trainscope", name: "trainscope", since: "2026-05", stack: "FastAPI, React", status: "PyPI", href: "https://pypi.org/project/trainscope/" },
  { id: "noesis", name: "noesis", since: "2026-06", stack: "PyTorch", status: "closed", href: "https://github.com/kaelvalen/noesis" },
  { id: "latch-lang", name: "latch-lang", since: "2026-02", stack: "Rust", status: "crates.io", href: "https://github.com/kaelvalen/latch-lang" },
  { id: "measure", name: "measure", since: "2026-10", stack: "Python, Claude Code", status: "public", href: "https://github.com/kaelvalen/measure" },
  { id: "connor", name: "connor", since: "2026-04", stack: "Rust", status: "public", href: "https://github.com/kaelvalen/connor" },
];

const also: Project[] = [
  { name: "engram", stack: "PyTorch", status: "public", href: "https://github.com/kaelvalen/engram" },
  { name: "weave", stack: "Tauri, React, Rust", status: "active", href: "https://github.com/kaelvalen/weave" },
  { name: "beyond_transformer", stack: "PyTorch", status: "superseded", href: "https://github.com/kaelvalen/beyond_transformer" },
  { name: "nanonet", stack: "Go, Rust, TypeScript", status: "archived", href: "https://github.com/kaelvalen/nanonet" },
];

// A slice through each basin of the wide map, as an SVG path in a 220 × 44 box: low loss is low.
const basins = basinsFor(false);
const f = surface(basins);
const slices = Object.fromEntries(
  basins.map((b) => {
    const s = slice(f, b);
    const lo = Math.min(...s), span = Math.max(...s) - lo || 1;
    const y = (v: number) => (40 - ((v - lo) / span) * 36).toFixed(1);
    return [b.id, { d: s.map((v, i) => `${i ? "L" : "M"}${((i / (s.length - 1)) * 220).toFixed(1)} ${y(v)}`).join(""), mid: y(s[s.length >> 1]) }];
  })
) as Record<BasinId, { d: string; mid: string }>;

export default function Projects() {
  const { t, locale } = useI18n();
  const p = t.projects;
  const month = (ym: string) => new Date(`${ym}-15T12:00:00Z`).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { month: "short", year: "numeric" });

  return (
    <section id="projects" data-sheet-id="projects" className="mx-auto grid max-w-[1280px] gap-10 px-5 pt-24 pb-20 sm:px-12 sm:pt-28 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
      <div>
        <h2 className="font-display text-[clamp(36px,3.6vw,48px)] leading-none tracking-[-0.02em] text-ink">{p.heading}</h2>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-muted">{p.sub}</p>
      </div>

      <div>
        <ul>
          {onMap.map((proj) => {
            const ridge = proj.id === "noesis";
            return (
              <li key={proj.id} className="border-t border-line last:border-b">
                <a href={proj.href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[minmax(0,1fr)_96px] gap-x-6 py-5 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <span>
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className={`font-display text-[24px] leading-tight italic transition-colors ${ridge ? "text-accent" : "text-ink group-hover:text-accent"}`}>
                        {BASIN_NAMES[proj.id]}
                        <span className="sr-only"> ({p.open})</span>
                      </span>
                      <span className="font-mono text-[12px] text-muted">{month(proj.since!)}</span>
                    </span>
                    <span className="mt-1 block max-w-[62ch] text-ink-soft text-pretty">{p.blurbs[proj.name]}</span>
                    <span className="mt-1 block text-[13px] text-muted">
                      {p.status[proj.status]}, {proj.stack}
                    </span>
                  </span>
                  <svg viewBox="0 0 220 44" preserveAspectRatio="none" aria-hidden className="mt-2 h-8 w-full overflow-visible">
                    <path d={slices[proj.id].d} fill="none" stroke="var(--line-strong)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                    <circle cx="110" cy={slices[proj.id].mid} r="3" fill={ridge ? "var(--accent)" : "var(--ink)"} />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>

        <h3 className="mt-14 mb-3 font-display text-[21px] text-ink italic">{p.also}</h3>
        <ul className="space-y-2.5">
          {also.map((proj) => (
            <li key={proj.name}>
              <a href={proj.href} target="_blank" rel="noopener noreferrer" className="group">
                <span className="font-mono text-[14px] text-ink group-hover:text-accent">{proj.name}</span>
                <span className="sr-only"> ({p.open})</span>
                <span className="text-ink-soft"> {p.blurbs[proj.name]}</span>
                <span className="text-[13px] text-muted"> ({p.status[proj.status]})</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-[64ch] text-[15px] leading-relaxed text-muted">
          {p.tools} {p.footnote}{" "}
          <a href="https://github.com/kaelvalen" target="_blank" rel="noopener noreferrer" className="link-line text-ink">
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}
