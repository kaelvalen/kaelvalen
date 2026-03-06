"use client";

import ScrollReveal from "./ScrollReveal";
import { SiPytorch, SiNvidia, SiGooglecolab, SiOnnx, SiHuggingface, SiWeightsandbiases, SiJupyter, SiNumpy, SiPython, SiCplusplus, SiRust, SiTypescript, SiLinux, SiDocker, SiGit, SiSqlite, SiReact, SiNextdotjs, SiTailwindcss, SiFastapi } from "react-icons/si";
import { IconType } from "react-icons";

type TechItem = { name: string; Icon: IconType };

const categories: {
  name: string;
  color: string;
  glowColor: string;
  icon: string;
  items: TechItem[];
}[] = [
  {
    name: "ML Frameworks",
    color: "accent",
    glowColor: "rgba(212,145,42,0.12)",
    icon: "⬡",
    items: [
      { name: "PyTorch", Icon: SiPytorch },
      { name: "CUDA", Icon: SiNvidia },
      { name: "JAX", Icon: SiGooglecolab },
      { name: "ONNX", Icon: SiOnnx },
    ],
  },
  {
    name: "Research Tools",
    color: "accent-pink",
    glowColor: "rgba(212,78,56,0.10)",
    icon: "◈",
    items: [
      { name: "HuggingFace", Icon: SiHuggingface },
      { name: "W&B", Icon: SiWeightsandbiases },
      { name: "Jupyter", Icon: SiJupyter },
      { name: "NumPy", Icon: SiNumpy },
    ],
  },
  {
    name: "Core Languages",
    color: "accent-green",
    glowColor: "rgba(82,168,120,0.10)",
    icon: "λ",
    items: [
      { name: "Python", Icon: SiPython },
      { name: "C++", Icon: SiCplusplus },
      { name: "Rust", Icon: SiRust },
      { name: "TypeScript", Icon: SiTypescript },
    ],
  },
  {
    name: "Infrastructure",
    color: "accent-orange",
    glowColor: "rgba(255,139,57,0.10)",
    icon: "⊞",
    items: [
      { name: "Linux", Icon: SiLinux },
      { name: "Docker", Icon: SiDocker },
      { name: "Git", Icon: SiGit },
      { name: "SQLite", Icon: SiSqlite },
    ],
  },
  {
    name: "Web Stack",
    color: "accent",
    glowColor: "rgba(212,145,42,0.10)",
    icon: "◇",
    items: [
      { name: "React", Icon: SiReact },
      { name: "Next.js", Icon: SiNextdotjs },
      { name: "Tailwind", Icon: SiTailwindcss },
      { name: "FastAPI", Icon: SiFastapi },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="py-28 px-4 sm:px-6 bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-4">
            <span className="font-mono text-accent text-lg mr-3">04.</span>
            Tech Stack
          </h2>
          <p className="text-text-secondary mb-16 max-w-2xl">
            Tools &amp; technologies I use to research, implement, and ship
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.name} delay={0.07 * i} direction="up">
              <div className="group relative bg-bg-card border border-border rounded-xl p-6 hover:border-border-hover hover:bg-bg-card-hover transition-all duration-300 h-full overflow-hidden">
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 80% 20%, ${cat.glowColor}, transparent 70%)` }}
                />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`text-lg text-${cat.color}`}>{cat.icon}</span>
                    <h3 className={`text-sm font-mono text-${cat.color} uppercase tracking-wider`}>
                      {cat.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {cat.items.map(({ name, Icon }) => (
                      <div
                        key={name}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface/60 border border-border hover:border-border-hover hover:bg-bg-card-hover transition-all cursor-default group/item"
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 text-text-muted group-hover/item:text-${cat.color} transition-colors`}
                        />
                        <span className="text-sm text-text-secondary group-hover/item:text-text transition-colors truncate">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
