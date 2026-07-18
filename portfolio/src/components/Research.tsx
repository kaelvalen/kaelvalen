import SectionHeader from "./SectionHeader";

const rows = [
  { config: "PRISM hybrid (SSD + GDR)", auc: "0.8908", mine: true },
  { config: "Gated DeltaNet only", auc: "0.8906", mine: false },
  { config: "PRISM legacy (S4D + GDR)", auc: "0.8882", mine: false },
  { config: "Mamba-2 only (SSD)", auc: "0.8836", mine: false },
  { config: "ResNet1D", auc: "0.8828", mine: false },
  { config: "small Transformer", auc: "0.8769", mine: false },
];

const notes = [
  "270+ tests — numerical equivalence vs torch.associative_scan & the FLA Triton kernels, fp64 gradcheck, streaming state-passing, property-based",
  "metric — macro one-vs-rest AUROC; baseline to match: xresnet1d101 ≈ 0.928",
  "constraint — everything fits in 8 GB of VRAM",
];

export default function Research() {
  return (
    <section id="research" className="py-16 md:py-24 border-t border-line">
      <SectionHeader n="01" title="Research" />

      <div className="grid md:grid-cols-12 gap-10 md:gap-8">
        {/* main column */}
        <div className="md:col-span-7">
          <h3 className="text-2xl md:text-3xl leading-tight mb-6">
            PRISM: one backbone, three signal types, no per-modality tuning.
          </h3>

          <div className="space-y-5 text-lg leading-relaxed text-ink-soft max-w-2xl">
            <p>
              Hybrid linear-recurrent backbones win on language, but their
              design choices are language-specific. PRISM interleaves
              Mamba-2-style SSD blocks with Gated Delta Rule blocks at 3:1 and
              applies the same backbone — identical hyperparameters — to
              12-lead ECG, spoken commands, and sequential images. Both mixers
              are implemented from scratch and held honest by
              numerical-equivalence tests against the production kernels.
            </p>
            <p>
              The follow-up, MoM, lets a per-token router choose which memory
              primitive handles each token instead of fixing the ratio by
              hand. The first spike gate failed: routing doesn&apos;t
              collapse, but recall lags the GDR-only baseline. That&apos;s the
              current problem.
            </p>
          </div>

          {/* numbers table */}
          <div className="mt-12 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted mb-3">
              Pipeline validation — PTB-XL super-diag, val macro-AUC
            </p>
            <div className="font-mono text-sm">
              <div className="flex justify-between gap-4 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                <span>config</span>
                <span>auc</span>
              </div>
              {rows.map((r) => (
                <div
                  key={r.config}
                  className={`flex justify-between gap-4 border-t border-line py-2 tabular-nums ${
                    r.mine ? "text-accent-deep font-medium" : "text-ink-soft"
                  }`}
                >
                  <span>{r.config}</span>
                  <span>{r.auc}</span>
                </div>
              ))}
              <div className="border-t border-line" />
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-muted mt-3">
              hidden 64 · 4 layers · 2 epochs · 1 seed · RTX 5060. Pipeline
              validation, not the paper&apos;s numbers — the full matrix runs
              at ~8M params, 3 seeds.
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
          <p className="border-t border-b border-line py-4 font-mono text-xs leading-relaxed">
            <a
              href="https://github.com/kaelvalen/prism"
              target="_blank"
              rel="noopener noreferrer"
              className="link-line text-accent-deep"
            >
              github.com/kaelvalen/prism
            </a>
            <span className="text-muted"> — code, tests, EXPERIMENTS.md, paper draft</span>
          </p>
        </aside>
      </div>
    </section>
  );
}
