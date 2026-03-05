export default function About() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-16">
          <span className="font-mono text-accent text-lg mr-3">01.</span>
          About Me
        </h2>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Text */}
          <div className="md:col-span-3 space-y-5 text-text-secondary leading-relaxed">
            <p>
              I&apos;m{" "}
              <strong className="text-text">Mehmet Arda Hakbilen</strong>, known
              online as <strong className="text-text">Kael Valen</strong>. I&apos;m
              an ML architecture researcher focused on questioning the
              transformer monopoly and exploring alternative sequence models.
            </p>
            <p>
              My approach is{" "}
              <em className="text-accent-pink">implementation-first</em>: I
              don&apos;t just read papers, I build architectures from scratch to
              truly understand the trade-offs between speed, expressiveness, and
              memory efficiency.
            </p>
            <p>
              Currently deep into State-Space Models (Mamba), RWKV, and Flash
              Attention v2 CUDA kernels. Every commit is a step toward
              understanding why — or why not — transformers are the answer.
            </p>
            <blockquote className="border-l-2 border-accent pl-4 mt-8 italic text-text-muted">
              &ldquo;Implementation over theory. Trade-offs over hype. Systematic
              learning over vibe coding.&rdquo;
            </blockquote>
          </div>

          {/* Stats */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {[
              { icon: "⟨ ⟩", label: "Focus", value: "Non-Transformer\nArchitectures" },
              { icon: "λ", label: "Approach", value: "Implementation\nFirst" },
              { icon: "∞", label: "Phase", value: "1 / 6\nFoundations" },
              { icon: "Δ", label: "Method", value: "Systematic\nLearning" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent/40 transition-colors group"
              >
                <span className="text-2xl text-accent group-hover:text-accent-hover transition-colors block mb-3">
                  {s.icon}
                </span>
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">
                  {s.label}
                </span>
                <span className="text-sm text-text font-medium whitespace-pre-line">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
