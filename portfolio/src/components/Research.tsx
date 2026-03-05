const researchAreas = [
  {
    color: "accent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <rect x="4" y="4" width="16" height="16" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: "State-Space Models",
    tag: "Mamba & RWKV Implementations",
    points: [
      "Linear-time inference vs quadratic attention complexity",
      "Selective state mechanisms for efficient memory",
      "Comparing trade-offs: speed vs expressiveness",
    ],
  },
  {
    color: "accent-pink",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Hybrid Architectures",
    tag: "RNN + Attention Combinations",
    points: [
      "Exploring best of both worlds: recurrence + selectivity",
      "Custom memory systems for long-context tasks",
      "Implementation-first approach to understanding",
    ],
  },
  {
    color: "accent-green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Flash Attention v2",
    tag: "From-Scratch CUDA Optimization",
    points: [
      "Understanding memory-efficient attention at kernel level",
      "Production inference optimization",
      "10x speedup through proper memory access patterns",
    ],
  },
];

export default function Research() {
  return (
    <section id="research" className="py-28 px-6 bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          <span className="font-mono text-accent text-lg mr-3">02.</span>
          Research Focus
        </h2>
        <p className="text-text-secondary mb-16 max-w-2xl">
          Questioning the assumption that transformers are the only viable
          solution
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {researchAreas.map((area) => (
            <div
              key={area.title}
              className="bg-bg-card border border-border rounded-xl p-7 hover:border-border-hover hover:bg-bg-card-hover transition-all group"
            >
              <div className={`text-${area.color} mb-5 group-hover:scale-110 transition-transform origin-left`}>
                {area.icon}
              </div>
              <h3 className="text-xl font-semibold mb-1 text-text">
                {area.title}
              </h3>
              <p className={`text-sm text-${area.color} font-mono mb-5`}>
                {area.tag}
              </p>
              <ul className="space-y-3">
                {area.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm text-text-secondary flex items-start gap-2"
                  >
                    <span className={`text-${area.color} mt-1 shrink-0`}>▹</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
