import SectionHeader from "./SectionHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";

const rows = [
  { config: "oracle routing (ceiling)", acc: "97.46", mine: false },
  { config: "cerata: closed-form ridge, 0 params", acc: "76.77", mine: true },
  { config: "per-task expert bank", acc: "70.58", mine: false },
  { config: "NCM prototype, training-free", acc: "70.34", mine: false },
  { config: "iCaRL", acc: "64.94", mine: false },
  { config: "v1 PAL-MoE", acc: "59.30", mine: false },
];

const notes = [
  "guards on every write / forget / consolidate: locality (canary argmax flips), reversibility (trial undo/redo, max|dW| ≤ 1e-10), order invariance (seeded permutation re-sum), router purity (0 trainable scalars).",
  "forget is a downdate: the medium path subtracts an edit's float64 sufficient statistics; removing the last edit restores the base model bitwise.",
  "constraint: everything runs on a single RTX 5060 Laptop within 8 GB VRAM.",
];

export default function Research() {
  return (
    <section id="research" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="01" title="Research" />

      {/* Top 12-col grid: Text & Marginalia */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-8">
        <div className="md:col-span-7">
          <h3 className="text-2xl md:text-3xl leading-tight text-balance mb-6">
            Loss dynamics, sequence architectures, and empirical limits.
          </h3>

          <div className="space-y-5 text-lg leading-relaxed text-ink-soft max-w-prose">
            <p>
              My main focus is{" "}
              <a
                href="https://pypi.org/project/trainscope/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-medium underline underline-offset-4 decoration-line hover:text-accent-deep hover:decoration-accent transition-colors"
              >
                trainscope
              </a>
              : a post-mortem flight recorder for LLM training loss spikes.
              Its CUSUM change-point detector catches gradual loss drift 5-20 steps before it turns
              into a full spike, validated with 0.0% false positives across 280+ noise scenarios and
              100% sensitivity for 0.10σ-0.50σ drift. When failure occurs, it reconstructs which layer
              moved first, whether from activation kurtosis or gradient explosion.
            </p>
            <p>
              Where trainscope watches training runs,{" "}
              <a
                href="https://github.com/kaelvalen/cerata"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-medium underline underline-offset-4 decoration-line hover:text-accent-deep hover:decoration-accent transition-colors"
              >
                CERATA
              </a>{" "}
              asks what a frozen model can still learn after deployment. Learning is an API call: a FAST key-value
              write for a single item, a MEDIUM closed-form edit from float64 sufficient statistics, and a SLOW
              consolidation into frozen experts. Every write and forget is guarded: locality, reversibility, order
              invariance, zero-parameter routing. Forget is an exact downdate. On frozen ViT-B/16 features
              (CIFAR-100, 20 tasks), its closed-form readout beats the v1 expert bank with zero trained parameters:
              76.77 vs 59.30.
            </p>
            <p>
              Earlier, I closed out{" "}
              <a
                href="https://github.com/kaelvalen/noesis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-medium underline underline-offset-4 decoration-line hover:text-accent-deep hover:decoration-accent transition-colors"
              >
                NOESIS
              </a>
              , testing if Titans-style associative memory matrices could inject continual learning directly into a frozen LLM manifold.
              The result was negative: frozen manifolds cannot assimilate untrained vector injections without distortion (0% recall on a 50-fact benchmark; full analysis in{" "}
              <a
                href="https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-medium underline underline-offset-4 decoration-line hover:text-accent-deep hover:decoration-accent transition-colors"
              >
                FINDINGS.md
              </a>
              ).
            </p>
          </div>
        </div>

        {/* margin notes */}
        <aside className="md:col-span-4 md:col-start-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted mb-4">
            Marginalia
          </p>
          {notes.map((note, i) => (
            <p
              key={i}
              className="border-t border-line py-4 font-mono text-xs leading-relaxed text-ink-soft"
            >
              {note}
            </p>
          ))}
          <div className="border-t border-b border-line py-4 font-mono text-xs leading-relaxed space-y-2">
            <div>
              <a
                href="https://pypi.org/project/trainscope/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-line text-ink hover:text-accent-deep"
              >
                pypi.org/project/trainscope
              </a>
              <span className="text-muted"> (loss spike debugger)</span>
            </div>
            <div>
              <a
                href="https://github.com/kaelvalen/cerata"
                target="_blank"
                rel="noopener noreferrer"
                className="link-line text-ink hover:text-accent-deep"
              >
                github.com/kaelvalen/cerata
              </a>
              <span className="text-muted"> (learning after deployment)</span>
            </div>
            <div>
              <a
                href="https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="link-line text-ink hover:text-accent-deep"
              >
                noesis / FINDINGS.md
              </a>
              <span className="text-muted"> (continual learning)</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Full-width Diagram across 12 cols */}
      <div className="mt-12">
        <ArchitectureDiagram />
      </div>

      {/* Bottom 12-col grid: Benchmark table */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-8 mt-12">
        <div className="md:col-span-7 w-full overflow-hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted mb-3">
            Learning after deployment: CIFAR-100, 20 tasks, frozen ViT-B/16
          </p>
          <div className="font-mono text-xs sm:text-sm w-full">
            <div className="flex justify-between gap-4 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted">
              <span>config</span>
              <span>acc</span>
            </div>
            {rows.map((r) => (
              <div
                key={r.config}
                className={`flex justify-between items-center gap-4 border-t border-line py-2.5 tabular-nums px-2 -mx-2 transition-all duration-150 hover:bg-paper-dim hover:pl-3 group ${
                  r.mine ? "text-accent-deep font-medium" : "text-ink-soft"
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-deep text-[10px] shrink-0">→</span>
                  <span className="min-w-0 text-pretty">{r.config}</span>
                </span>
                <span className="shrink-0">{r.acc}</span>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>

        <aside className="md:col-span-4 md:col-start-9 flex flex-col justify-end">
          <div className="border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-muted">
            <span className="uppercase tracking-wider text-ink block mb-1 font-medium">Validation Specs</span>
            frozen ViT-B/16 · CIFAR-100 · 20 tasks · 3 seeds · RTX 5060. Closed-form
            readouts: 0 parameters, 0 optimizer steps; not comparable to published CIL
            tables (ImageNet-1K features, not 21K).
          </div>
        </aside>
      </div>
    </section>
  );
}
