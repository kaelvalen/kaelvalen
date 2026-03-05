const projects = [
  {
    title: "Beyond Transformer",
    description:
      "Open-source alternative architecture research. Implementation-first approach to understanding non-transformer models. Building Mamba, RWKV, and hybrid systems from scratch to compare trade-offs.",
    highlights: [
      "Flash Attention v2 from scratch",
      "Mamba state-space model analysis",
      "RWKV architecture comparison",
    ],
    tech: ["PyTorch", "JAX", "CUDA", "ONNX"],
    github: "https://github.com/kaelvalen/beyond_transformer",
    badge: null,
  },
  {
    title: "SentinelFS",
    description:
      "Distributed P2P file sync with ML-based anomaly detection, delta-sync algorithms, and genetic topology remeshing for fault tolerance.",
    highlights: [
      "ML anomaly detection pipeline",
      "Self-healing network topology",
      "Zero-copy delta sync protocol",
      "Byzantine fault tolerance",
    ],
    tech: ["C++17", "Threading", "P2P", "ML"],
    github: "https://github.com/kaelvalen/SentinelFS",
    badge: "Archived",
  },
  {
    title: "Research Blog",
    description:
      "Implementation notes & architecture analysis. Documenting the learning journey: from-scratch implementations, architecture comparisons, and trade-off analysis.",
    highlights: [
      "Mamba vs Transformer trade-offs",
      "Flash Attention internals",
      "CUDA kernel optimization",
      "JAX vs PyTorch for research",
    ],
    tech: ["Markdown", "GitHub Pages", "Technical Writing"],
    github: null,
    badge: "Planned",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-16">
          <span className="font-mono text-accent text-lg mr-3">03.</span>
          Featured Projects
        </h2>

        <div className="grid gap-6">
          {projects.map((project) => (
            <article
              key={project.title}
              className="bg-bg-card border border-border rounded-xl p-7 hover:border-border-hover hover:bg-bg-card-hover transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-6 h-6 text-accent"
                  >
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                  {project.badge && (
                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                        project.badge === "Archived"
                          ? "text-accent-orange border-accent-orange/30"
                          : "text-accent-green border-accent-green/30"
                      }`}
                    >
                      {project.badge}
                    </span>
                  )}
                </div>

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Repository"
                    className="text-text-muted hover:text-accent transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                )}
              </div>

              <p className="text-text-secondary mb-5 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {project.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-xs text-text-muted bg-surface px-3 py-1 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-accent px-2 py-0.5 border border-accent/20 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
