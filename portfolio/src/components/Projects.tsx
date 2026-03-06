"use client";

import ScrollReveal from "./ScrollReveal";
import ParallaxCard from "./ParallaxCard";

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const featured = {
  title: "Beyond Transformer",
  description:
    "Open-source alternative architecture research. Implementation-first approach to understanding non-transformer models. Building Mamba, RWKV, and hybrid systems from scratch to deeply compare trade-offs in speed, memory, and expressiveness.",
  highlights: [
    { label: "Flash Attention v2 from scratch", done: true },
    { label: "Mamba state-space model analysis", done: true },
    { label: "RWKV architecture comparison", done: false },
    { label: "Hybrid SSM + Attention benchmarks", done: false },
  ],
  tech: ["PyTorch", "JAX", "CUDA", "ONNX"],
  github: "https://github.com/kaelvalen/beyond_transformer",
  metrics: [
    { label: "Inference", value: "2.1ms/tok", color: "accent-green" },
    { label: "Memory", value: "O(n)", color: "accent" },
    { label: "vs Transformer", value: "4.2×", color: "accent-pink" },
  ],
};

const otherProjects = [
  {
    title: "SentinelFS",
    description:
      "Distributed P2P file sync with ML-based anomaly detection, delta-sync algorithms, and genetic topology remeshing for fault tolerance.",
    highlights: ["ML anomaly detection", "Self-healing topology", "Zero-copy delta sync", "Byzantine fault tolerance"],
    tech: ["C++17", "Threading", "P2P", "ML"],
    github: "https://github.com/kaelvalen/SentinelFS",
    badge: "Archived",
    badgeColor: "accent-orange",
  },
  {
    title: "Research Blog",
    description:
      "Implementation notes & architecture analysis. Documenting the learning journey: from-scratch implementations, architecture comparisons, and trade-off analysis.",
    highlights: ["Mamba vs Transformer", "Flash Attention internals", "CUDA kernel optimization", "JAX vs PyTorch"],
    tech: ["Markdown", "GitHub Pages", "Technical Writing"],
    github: null,
    badge: "Planned",
    badgeColor: "accent-green",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">
            <span className="font-mono text-accent text-lg mr-3">03.</span>
            Featured Projects
          </h2>
          <p className="text-text-secondary mb-16 max-w-2xl">
            Building real systems to validate architectural assumptions
          </p>
        </ScrollReveal>

        {/* Featured project */}
        <ParallaxCard depth={18}>
          <article className="relative bg-bg-card border border-accent/20 rounded-2xl p-5 sm:p-8 mb-6 group hover:border-accent/40 hover:bg-bg-card-hover transition-all duration-300 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(212,145,42,0.08), transparent 60%)" }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                    ★ Featured
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
                    Active
                  </span>
                </div>
                <a
                  href={featured.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                  className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-sm"
                >
                  <GitHubIcon />
                  <ExternalLinkIcon />
                </a>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-white transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {featured.description}
                  </p>

                  {/* Progress checklist */}
                  <div className="space-y-2 mb-6">
                    {featured.highlights.map((h) => (
                      <div key={h.label} className="flex items-center gap-2.5 text-sm">
                        <span className={h.done ? "text-accent-green" : "text-border"}>
                          {h.done ? "✓" : "○"}
                        </span>
                        <span className={h.done ? "text-text-secondary" : "text-text-muted"}>
                          {h.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {featured.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono text-accent px-2.5 py-1 border border-accent/20 rounded-lg bg-accent/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics panel */}
                <div className="flex flex-col gap-3 justify-start">
                  <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-1">
                    Benchmarks (Mamba-130M)
                  </p>
                  {featured.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="bg-bg-secondary border border-border rounded-xl px-5 py-4"
                    >
                      <div className={`text-2xl font-bold font-mono text-${m.color} mb-0.5`}>
                        {m.value}
                      </div>
                      <div className="text-xs text-text-muted">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </ParallaxCard>

        {/* Other projects grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {otherProjects.map((project, i) => (
            <ParallaxCard key={project.title} delay={0.1 * (i + 1)} depth={14 + i * 6}>
              <article className="bg-bg-card border border-border rounded-xl p-7 hover:border-border-hover hover:bg-bg-card-hover transition-all group h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border border-${project.badgeColor}/30 text-${project.badgeColor}`}>
                      {project.badge}
                    </span>
                  </div>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-text-muted hover:text-accent transition-colors"
                    >
                      <GitHubIcon />
                    </a>
                  )}
                </div>

                <p className="text-text-secondary mb-5 leading-relaxed text-sm flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.highlights.map((h) => (
                    <span key={h} className="text-xs text-text-muted bg-surface px-2.5 py-1 rounded-full border border-border">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs font-mono text-accent px-2 py-0.5 border border-accent/20 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </ParallaxCard>
          ))}
        </div>
      </div>
    </section>
  );
}
