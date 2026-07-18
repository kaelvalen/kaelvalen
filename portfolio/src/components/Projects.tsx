import SectionHeader from "./SectionHeader";

type Project = {
  name: string;
  blurb: string;
  stack: string;
  status: string;
  href: string;
};

const projects: Project[] = [
  {
    name: "prism",
    blurb: "modality-portable SSD + Gated Delta Rule sequence backbone",
    stack: "PyTorch",
    status: "active",
    href: "https://github.com/kaelvalen/prism",
  },
  {
    name: "trainscope",
    blurb: "loss-spike flight recorder for LLM training runs",
    stack: "FastAPI · React",
    status: "PyPI",
    href: "https://pypi.org/project/trainscope/",
  },
  {
    name: "latch-lang",
    blurb: "a programming language of my own",
    stack: "Rust",
    status: "crates.io",
    href: "https://github.com/kaelvalen/latch-lang",
  },
  {
    name: "connor",
    blurb: "terminal-native CI/CD runner — DAG execution, no YAML",
    stack: "Rust",
    status: "public",
    href: "https://github.com/kaelvalen/connor",
  },
  {
    name: "weave",
    blurb: "local-first, plugin-based productivity system",
    stack: "Tauri · React · Rust",
    status: "active",
    href: "https://github.com/kaelvalen/weave",
  },
  {
    name: "open-glyph",
    blurb: "pixel-art editor for the Nothing Phone glyph matrix",
    stack: "Kotlin",
    status: "public",
    href: "https://github.com/kaelvalen/open-glyph",
  },
  {
    name: "beyond_transformer",
    blurb: "PULSE — the predecessor to PRISM, kept as the design record",
    stack: "PyTorch",
    status: "superseded",
    href: "https://github.com/kaelvalen/beyond_transformer",
  },
  {
    name: "nanonet",
    blurb: "monitoring & control for distributed services, ~70k lines",
    stack: "Go · Rust · TS",
    status: "archived",
    href: "https://github.com/kaelvalen/nanonet",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="02" title="Projects — an index" />

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

        {projects.map((p, i) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-1 border-t border-line last:border-b py-4 md:py-5 items-baseline hover:bg-ink hover:text-paper transition-colors px-2 -mx-2"
          >
            <span className="hidden md:block col-span-1 font-mono text-xs text-muted group-hover:text-paper/50 transition-colors">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="col-span-1 md:col-span-3 font-mono text-sm font-medium">
              {p.name}
            </span>
            <span className="col-span-2 md:col-span-4 text-base leading-snug text-ink-soft group-hover:text-paper/80 transition-colors">
              {p.blurb}
            </span>
            <span className="hidden md:block col-span-2 font-mono text-xs text-muted group-hover:text-paper/50 transition-colors">
              {p.stack}
            </span>
            <span className="col-span-1 font-mono text-xs text-accent-deep group-hover:text-accent transition-colors">
              {p.status}
            </span>
            <span className="col-span-1 text-right font-mono text-xs text-muted group-hover:text-paper transition-colors">
              ↗
            </span>
          </a>
        ))}
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-muted mt-6">
        everything above is original work — no forks. the full list, including
        the experiments that didn&apos;t make the cut, is on{" "}
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
