"use client";

import ScrollReveal from "./ScrollReveal";
import ParallaxCard from "./ParallaxCard";

const researchAreas = [
  {
    color: "accent",
    glowColor: "rgba(229,62,62,0.15)",
    borderGlow: "rgba(229,62,62,0.4)",
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
    status: "Active",
    statusColor: "accent-green",
    points: [
      "Linear-time inference vs quadratic attention complexity",
      "Selective state mechanisms for efficient memory",
      "Comparing trade-offs: speed vs expressiveness",
    ],
  },
  {
    color: "accent-pink",
    glowColor: "rgba(252,129,129,0.12)",
    borderGlow: "rgba(252,129,129,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Hybrid Architectures",
    tag: "RNN + Attention Combinations",
    status: "Exploring",
    statusColor: "accent-orange",
    points: [
      "Exploring best of both worlds: recurrence + selectivity",
      "Custom memory systems for long-context tasks",
      "Implementation-first approach to understanding",
    ],
  },
  {
    color: "accent-green",
    glowColor: "rgba(104,211,145,0.12)",
    borderGlow: "rgba(104,211,145,0.35)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Flash Attention v2",
    tag: "From-Scratch CUDA Optimization",
    status: "Deep-dive",
    statusColor: "accent",
    points: [
      "Understanding memory-efficient attention at kernel level",
      "Production inference optimization",
      "10x speedup through proper memory access patterns",
    ],
  },
];

export default function Research() {
  return (
    <section id="research" className="py-28 px-4 sm:px-6 bg-bg-secondary relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">
            <span className="font-mono text-accent text-lg mr-3">02.</span>
            Research Focus
          </h2>
          <p className="text-text-secondary mb-16 max-w-2xl">
            Questioning the assumption that transformers are the only viable
            solution
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {researchAreas.map((area, i) => (
            <ParallaxCard key={area.title} delay={0.1 * i} depth={20 + i * 6}>
              <div
                className={`group relative bg-bg-card border border-border rounded-xl p-7 transition-all duration-300 cursor-default h-full
                  hover:border-[${area.borderGlow}] hover:bg-bg-card-hover`}
                style={{
                  ["--glow" as string]: area.glowColor,
                }}
              >
                {/* Glow blob on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${area.glowColor}, transparent 70%)` }}
                />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`text-${area.color} group-hover:scale-110 transition-transform origin-left duration-200`}>
                      {area.icon}
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border border-${area.statusColor}/30 text-${area.statusColor}`}>
                      {area.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-1 text-text group-hover:text-white transition-colors">
                    {area.title}
                  </h3>
                  <p className={`text-sm text-${area.color} font-mono mb-5 opacity-80`}>
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
              </div>
            </ParallaxCard>
          ))}
        </div>
      </div>
    </section>
  );
}
