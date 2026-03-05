const categories = [
  {
    name: "ML Frameworks",
    items: ["PyTorch", "CUDA", "JAX", "ONNX"],
  },
  {
    name: "Research Tools",
    items: ["HuggingFace", "W&B", "Jupyter", "NumPy"],
  },
  {
    name: "Core Languages",
    items: ["Python", "C++", "Rust", "TypeScript"],
  },
  {
    name: "Infrastructure",
    items: ["Linux", "Docker", "Git", "SQLite"],
  },
  {
    name: "Web Stack",
    items: ["React", "Next.js", "Tailwind", "FastAPI"],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="py-28 px-6 bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-16">
          <span className="font-mono text-accent text-lg mr-3">04.</span>
          Tech Stack
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-bg-card border border-border rounded-xl p-6 hover:border-border-hover transition-colors"
            >
              <h3 className="text-sm font-mono text-accent mb-4 uppercase tracking-wider">
                {cat.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="text-sm text-text bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-accent/40 hover:text-accent transition-colors cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
