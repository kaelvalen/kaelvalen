"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";

type Project = {
  name: string;
  blurb: string;
  stack: string;
  status: string;
  href: string;
  cat: "ml" | "systems" | "apps";
};

const projects: Project[] = [
  {
    name: "engram",
    blurb: "modality-portable SSD + Gated Delta Rule sequence backbone",
    stack: "PyTorch",
    status: "active",
    href: "https://github.com/kaelvalen/engram",
    cat: "ml",
  },
  {
    name: "trainscope",
    blurb: "loss-spike flight recorder for LLM training runs",
    stack: "FastAPI · React",
    status: "PyPI",
    href: "https://pypi.org/project/trainscope/",
    cat: "ml",
  },
  {
    name: "latch-lang",
    blurb: "a programming language of my own",
    stack: "Rust",
    status: "crates.io",
    href: "https://github.com/kaelvalen/latch-lang",
    cat: "systems",
  },
  {
    name: "connor",
    blurb: "terminal-native CI/CD runner (DAG execution, no YAML)",
    stack: "Rust",
    status: "public",
    href: "https://github.com/kaelvalen/connor",
    cat: "systems",
  },
  {
    name: "weave",
    blurb: "local-first, plugin-based productivity system",
    stack: "Tauri · React · Rust",
    status: "active",
    href: "https://github.com/kaelvalen/weave",
    cat: "apps",
  },
  {
    name: "beyond_transformer",
    blurb: "PULSE: predecessor to ENGRAM, kept as design record",
    stack: "PyTorch",
    status: "superseded",
    href: "https://github.com/kaelvalen/beyond_transformer",
    cat: "ml",
  },
  {
    name: "nanonet",
    blurb: "monitoring & control for distributed services, ~70k lines",
    stack: "Go · Rust · TS",
    status: "archived",
    href: "https://github.com/kaelvalen/nanonet",
    cat: "systems",
  },
];

export default function Projects() {
  const [filter, setFilter] = useState<"all" | "ml" | "systems" | "apps">("all");

  const countAll = projects.length;
  const countMl = projects.filter((p) => p.cat === "ml").length;
  const countSystems = projects.filter((p) => p.cat === "systems").length;
  const countApps = projects.filter((p) => p.cat === "apps").length;

  const filtered = filter === "all" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <section id="projects" className="py-16 md:py-24 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
        <SectionHeader n="02" title="Projects" />

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 border cursor-pointer transition-all ${
              filter === "all" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
            }`}
          >
            all ({countAll})
          </button>
          <button
            onClick={() => setFilter("ml")}
            className={`px-2.5 py-1 border cursor-pointer transition-all ${
              filter === "ml" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
            }`}
          >
            ml & research ({countMl})
          </button>
          <button
            onClick={() => setFilter("systems")}
            className={`px-2.5 py-1 border cursor-pointer transition-all ${
              filter === "systems" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
            }`}
          >
            systems ({countSystems})
          </button>
          <button
            onClick={() => setFilter("apps")}
            className={`px-2.5 py-1 border cursor-pointer transition-all ${
              filter === "apps" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
            }`}
          >
            apps & tools ({countApps})
          </button>
        </div>
      </div>

      <div>
        {/* header row */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span className="col-span-1">no.</span>
          <span className="col-span-3">name</span>
          <span className="col-span-4">what it is</span>
          <span className="col-span-2">stack</span>
          <span className="col-span-1">status</span>
          <span className="col-span-1 text-right">link</span>
        </div>

        {filtered.map((p, i) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col md:grid md:grid-cols-12 gap-y-1.5 md:gap-x-4 border-t border-line last:border-b py-4 md:py-5 items-baseline hover:bg-ink hover:text-paper transition-all duration-150 px-3 -mx-3"
          >
            <span className="hidden md:block col-span-1 font-mono text-xs text-muted group-hover:text-paper/50 transition-colors">
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Mobile header / Desktop name */}
            <div className="w-full md:w-auto flex items-baseline justify-between md:col-span-3">
              <span className="font-mono text-sm font-medium transition-transform duration-150 group-hover:translate-x-1">
                {p.name}
              </span>
              <div className="flex items-center gap-3 md:hidden">
                <span className="font-mono text-xs text-accent-deep group-hover:text-accent transition-colors">
                  {p.status}
                </span>
                <span className="font-mono text-xs text-muted group-hover:text-paper transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </div>
            </div>

            {/* Blurb */}
            <span className="md:col-span-4 text-sm sm:text-base leading-snug text-ink-soft group-hover:text-paper/80 transition-colors">
              {p.blurb}
            </span>

            {/* Stack */}
            <span className="md:col-span-2 font-mono text-[11px] sm:text-xs text-muted group-hover:text-paper/60 transition-colors">
              {p.stack}
            </span>

            {/* Desktop status & link */}
            <span className="hidden md:block col-span-1 font-mono text-xs text-accent-deep group-hover:text-accent transition-colors">
              {p.status}
            </span>
            <span className="hidden md:block col-span-1 text-right font-mono text-xs text-muted group-hover:text-paper transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        ))}
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-muted mt-6">
        all projects above are original work (no forks). full index on{" "}
        <a
          href="https://github.com/kaelvalen"
          target="_blank"
          rel="noopener noreferrer"
          className="link-line"
        >
          github
        </a>
        .
      </p>
    </section>
  );
}
