import SectionHeader from "./SectionHeader";
import ArchitectureDiagram from "./ArchitectureDiagram";

const rows = [
  { config: "ENGRAM hybrid (SSD + GDR)", auc: "0.8908", mine: true },
  { config: "Gated DeltaNet only", auc: "0.8906", mine: false },
  { config: "ENGRAM legacy (S4D + GDR)", auc: "0.8882", mine: false },
  { config: "Mamba-2 only (SSD)", auc: "0.8836", mine: false },
  { config: "ResNet1D", auc: "0.8828", mine: false },
  { config: "small Transformer", auc: "0.8769", mine: false },
];

const notes = [
  "312 tests (1 skipped): numerical equivalence vs torch.associative_scan & Triton kernels, fp64 gradcheck, streaming state passing.",
  "metric: macro one-vs-rest AUROC (baseline: xresnet1d101 ≈ 0.928).",
  "constraint: everything runs within 8 GB VRAM.",
];

export default function Research() {
  return (
    <section id="research" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="01" title="Research" />

      {/* Top 12-col grid: Text & Marginalia */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-8">
        <div className="md:col-span-7">
          <h3 className="text-2xl md:text-3xl leading-tight mb-6">
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
              Trainscope grew out of work on{" "}
              <a
                href="https://github.com/kaelvalen/engram"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-medium underline underline-offset-4 decoration-line hover:text-accent-deep hover:decoration-accent transition-colors"
              >
                ENGRAM
              </a>
              , a hybrid sequence backbone interleaving Mamba-2 SSD blocks with Gated Delta Rule blocks (3:1 ratio).
              It applies identical hyperparameters to 12-lead ECG, spoken commands, and sequential images, verified
              end-to-end across 312 numerical equivalence and streaming tests.
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
                className="link-line text-accent-deep"
              >
                pypi.org/project/trainscope
              </a>
              <span className="text-muted"> (loss spike debugger)</span>
            </div>
            <div>
              <a
                href="https://github.com/kaelvalen/engram"
                target="_blank"
                rel="noopener noreferrer"
                className="link-line text-accent-deep"
              >
                github.com/kaelvalen/engram
              </a>
              <span className="text-muted"> (ENGRAM backbone)</span>
            </div>
            <div>
              <a
                href="https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="link-line text-accent-deep"
              >
                noesis / FINDINGS.md
              </a>
              <span className="text-muted"> (continual learning)</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Full-width Diagram across 12 cols */}
      <div className="mt-10">
        <ArchitectureDiagram />
      </div>

      {/* Bottom 12-col grid: Benchmark table */}
      <div className="grid md:grid-cols-12 gap-10 md:gap-8 mt-12">
        <div className="md:col-span-7 w-full overflow-hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted mb-3">
            Pipeline validation: PTB-XL super-diag, val macro-AUC
          </p>
          <div className="font-mono text-xs sm:text-sm w-full">
            <div className="flex justify-between gap-4 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted">
              <span>config</span>
              <span>auc</span>
            </div>
            {rows.map((r) => (
              <div
                key={r.config}
                className={`flex justify-between items-center gap-4 border-t border-line py-2.5 tabular-nums px-2 -mx-2 transition-all duration-150 hover:bg-paper-dim hover:pl-3 group ${
                  r.mine ? "text-accent-deep font-medium" : "text-ink-soft"
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-deep text-[10px] shrink-0">→</span>
                  <span className="truncate">{r.config}</span>
                </span>
                <span className="shrink-0">{r.auc}</span>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>

        <aside className="md:col-span-4 md:col-start-9 flex flex-col justify-end">
          <div className="border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-muted">
            <span className="uppercase tracking-wider text-ink block mb-1 font-medium">Validation Specs</span>
            hidden 64 · 4 layers · 2 epochs · 1 seed · RTX 5060. Pipeline
            validation (not paper numbers): full matrix runs at ~8M params, 3 seeds.
          </div>
        </aside>
      </div>
    </section>
  );
}
