"use client";

import { useState } from "react";

type Mode = "cerata" | "trainscope";
type CerataScale = "fast" | "medium" | "slow";
type CerataCard = {
  type: string;
  name: string;
  desc: string;
  formula: string;
  metric: string;
  specs: string[];
};
type CerataLane = {
  id: CerataScale;
  tab: string;
  sub: string;
  title: string;
  mechanics: string[];
  api: string[];
};

function Connector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2 text-muted">
      <span aria-hidden className="text-[11px] leading-none">│</span>
      <span className="text-[9px] uppercase tracking-[0.14em] font-mono text-center max-w-[16rem]">{label}</span>
      <span aria-hidden className="text-[11px] leading-none">▼</span>
    </div>
  );
}

export default function ArchitectureDiagram() {
  const [mode, setMode] = useState<Mode>("trainscope");
  const [cerataScale, setCerataScale] = useState<CerataScale>("fast");
  const [activeCard, setActiveCard] = useState<number>(0);
  const [hoverStep, setHoverStep] = useState<number>(43);
  const [lrSurge, setLrSurge] = useState<"1.0" | "2.5" | "5.0">("1.0");

  const cerataLanes: CerataLane[] = [
    {
      id: "fast",
      tab: "FAST",
      sub: "single item",
      title: "Append-only KV memory",
      mechanics: ["key = h · value = label / text", "O(1) write · exact delete"],
      api: ["write", "forget"],
    },
    {
      id: "medium",
      tab: "MEDIUM",
      sub: "new batch",
      title: "Closed-form linear edit",
      mechanics: [
        "A = ΣKᵀK · B = ΣKᵀV",
        "W = A⁻¹B · one accumulator pair",
        "learn adds · forget subtracts",
      ],
      api: ["write", "forget"],
    },
    {
      id: "slow",
      tab: "SLOW",
      sub: "consolidation",
      title: "Frozen representation experts",
      mechanics: [
        "identity-init → train once → freeze",
        "by_arrival control · by_confusion gated",
      ],
      api: ["consolidate"],
    },
  ];

  const cerataGuards: { n: number; name: string; check: string }[] = [
    { n: 1, name: "Locality", check: "canary argmax flip rate + max |Δoutput|" },
    { n: 2, name: "Reversibility", check: "trial undo/redo · max |dW| ≤ 1e-10, canary identical" },
    { n: 3, name: "Order invariance", check: "accumulator vs contributions re-summed in a seeded permutation" },
    { n: 4, name: "Router purity", check: "0 trainable scalars reachable from the router" },
  ];

  const cerataPaths: Record<CerataScale, CerataCard[]> = {
    fast: [
      {
        type: "FAST",
        name: "Append-only Key-Value Memory",
        desc: "The frozen base emits the hidden state h at a chosen layer; h is the key and the label or text is the value. One fixed address space, never trained.",
        formula: "write: M ← M ∪ {(h, label)}",
        metric: "O(1) write",
        specs: ["key: h (frozen address)", "value: label or text", "base: content-hashed, immutable"],
      },
      {
        type: "FAST",
        name: "Parameter-free Retrieval",
        desc: "Keys are never trained. Retrieval is exact cosine over the frozen addresses. No learned query, no router parameters on the fast path.",
        formula: "ŷ = argmax_i cos(h, h_i)",
        metric: "exact cosine",
        specs: ["retrieval: exact cosine", "learned params: 0", "index: ExactCosineIndex"],
      },
      {
        type: "FAST",
        name: "Exact Delete",
        desc: "forget(id) removes a single memory row exactly, with no retraining and no drift.",
        formula: "forget(id): M ← M \\ {(h_id, v_id)}",
        metric: "exact delete",
        specs: ["forget: exact delete", "cost: O(1)", "keys trained: never"],
      },
    ],
    medium: [
      {
        type: "MEDIUM",
        name: "Sufficient Statistics",
        desc: "A new batch becomes a closed-form linear edit from float64 sufficient statistics, held in one accumulator pair.",
        formula: "A = Σ KᵀK,  B = Σ KᵀV",
        metric: "accumulator",
        specs: ["stats: float64", "accumulators: A, B", "size: independent of #edits"],
      },
      {
        type: "MEDIUM",
        name: "Closed-Form Solution",
        desc: "The solution W = A⁻¹B is order-invariant: contributions are additive, so the edit does not depend on when it lands.",
        formula: "W = A⁻¹ B",
        metric: "order-invariant",
        specs: ["solution: W = A⁻¹B", "order: invariant", "matches one-shot ridge"],
      },
      {
        type: "MEDIUM",
        name: "Downdate / Forget",
        desc: "Learning adds an edit's contribution; forget subtracts it. Removal is exact, fp-close rather than bitwise, with drift measured by the guards.",
        formula: "A ← A − ΔA,  B ← B − ΔB",
        metric: "downdate",
        specs: ["learn: add contribution", "forget: subtract (downdate)", "tolerance: 1e-10 · drift ≤ 4.2e-13"],
      },
    ],
    slow: [
      {
        type: "SLOW",
        name: "Frozen Representation Experts",
        desc: "Representation experts are trained once at consolidation, then frozen. They are identity-initialized and function-preserving.",
        formula: "E(z) = z + Δ(z),  E_init = id",
        metric: "train once, freeze",
        specs: ["map: Z → Z", "init: identity (function-preserving)", "after fit: frozen"],
      },
      {
        type: "SLOW",
        name: "Boundary Policy",
        desc: "Which data trains which expert is a pluggable policy, not a fixed rule: by_arrival is the control, by_confusion is experimental and gated.",
        formula: "π: data ↦ expert ∈ {by_arrival, by_confusion}",
        metric: "pluggable policy",
        specs: ["by_arrival: control", "by_confusion: gated behind prereg", "boundaries: policy-defined"],
      },
      {
        type: "SLOW",
        name: "Consolidate & Freeze",
        desc: "Consolidation runs over pending data under the guards, then freezes the experts. The bank buys isolation, not capacity.",
        formula: "consolidate(policy) → ConsolidationReport",
        metric: "immutable after fit",
        specs: ["experts added: isolated", "after fit: frozen", "reversibility: bitwise"],
      },
    ],
  };

  const currentCards = cerataPaths[cerataScale];
  const activeCardData = currentCards[activeCard] || currentCards[0];
  const currentScale = cerataLanes.find((l) => l.id === cerataScale);

  // Realistic simulated data profiles for 1.0x, 2.5x, and 5.0x LR surge
  const getSimulationProfile = (surge: "1.0" | "2.5" | "5.0") => {
    if (surge === "1.0") {
      return {
        kurtosisAlertStep: 43,
        cusumAlertStep: 50,
        kurtosisLabel: "Kurtosis Fire (16.7s lead)",
        cusumLabel: "CUSUM Fire (9.7s lead)",
        points: [
          {
            step: 10,
            loss: 3.42,
            cusum: 0.02,
            kurtosis: 3.01,
            status: "Normal Steady State",
            layer: "All layers operating within nominal gradients (L2 ≈ 0.12)",
            grads: [
              { name: "Layer 2", l2: 0.12, pct: 15, status: "normal" },
              { name: "Layer 8", l2: 0.18, pct: 20, status: "normal" },
              { name: "Layer 14", l2: 0.15, pct: 18, status: "normal" },
              { name: "Layer 18", l2: 0.11, pct: 14, status: "normal" },
            ],
          },
          {
            step: 25,
            loss: 2.38,
            cusum: 0.08,
            kurtosis: 3.12,
            status: "Normal Steady State",
            layer: "Loss decreasing smoothly (L2 ≈ 0.18)",
            grads: [
              { name: "Layer 2", l2: 0.14, pct: 16, status: "normal" },
              { name: "Layer 8", l2: 0.22, pct: 22, status: "normal" },
              { name: "Layer 14", l2: 0.19, pct: 20, status: "normal" },
              { name: "Layer 18", l2: 0.12, pct: 15, status: "normal" },
            ],
          },
          {
            step: 43,
            loss: 2.12,
            cusum: 0.28,
            kurtosis: 7.84,
            status: "KURTOSIS ALERT (16.7 steps early warning)",
            layer: "Block 14 activation kurtosis spike (7.84 > 3.5 margin)",
            grads: [
              { name: "Layer 2", l2: 0.25, pct: 25, status: "normal" },
              { name: "Layer 8", l2: 0.41, pct: 35, status: "normal" },
              { name: "Layer 14", l2: 1.85, pct: 65, status: "warning" },
              { name: "Layer 18", l2: 0.38, pct: 30, status: "normal" },
            ],
          },
          {
            step: 50,
            loss: 2.26,
            cusum: 0.95,
            kurtosis: 12.4,
            status: "CUSUM DRIFT ALERT (9.7 steps early warning)",
            layer: "Persistent loss drift (+0.22σ) detected in Block 14",
            grads: [
              { name: "Layer 2", l2: 0.38, pct: 30, status: "normal" },
              { name: "Layer 8", l2: 0.95, pct: 45, status: "warning" },
              { name: "Layer 14", l2: 4.82, pct: 85, status: "alert" },
              { name: "Layer 18", l2: 1.12, pct: 50, status: "warning" },
            ],
          },
          {
            step: 56,
            loss: 3.45,
            cusum: 3.40,
            kurtosis: 28.1,
            status: "GRADIENT EXPLOSION CASCADE",
            layer: "Layer 14 L2 norm explosion (14.82) propagating to Layer 18",
            grads: [
              { name: "Layer 2", l2: 1.15, pct: 50, status: "warning" },
              { name: "Layer 8", l2: 3.84, pct: 75, status: "alert" },
              { name: "Layer 14", l2: 14.82, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 8.15, pct: 88, status: "critical" },
            ],
          },
          {
            step: 60,
            loss: 9.84,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "FULL SPIKE COLLAPSE",
            layer: "NaN parameters / Optimizer update corrupted",
            grads: [
              { name: "Layer 2", l2: 12.4, pct: 90, status: "critical" },
              { name: "Layer 8", l2: 45.2, pct: 98, status: "critical" },
              { name: "Layer 14", l2: 182.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 96.4, pct: 99, status: "critical" },
            ],
          },
        ],
      };
    } else if (surge === "2.5") {
      return {
        kurtosisAlertStep: 25,
        cusumAlertStep: 43,
        kurtosisLabel: "Kurtosis Fire (Step 25)",
        cusumLabel: "CUSUM Drift (Step 43)",
        points: [
          {
            step: 10,
            loss: 3.42,
            cusum: 0.05,
            kurtosis: 3.08,
            status: "Accelerated Learning",
            layer: "Higher learning rate causes rapid gradient changes",
            grads: [
              { name: "Layer 2", l2: 0.28, pct: 28, status: "normal" },
              { name: "Layer 8", l2: 0.42, pct: 40, status: "normal" },
              { name: "Layer 14", l2: 0.38, pct: 36, status: "normal" },
              { name: "Layer 18", l2: 0.24, pct: 25, status: "normal" },
            ],
          },
          {
            step: 25,
            loss: 2.55,
            cusum: 0.35,
            kurtosis: 7.90,
            status: "KURTOSIS ALERT (Accelerated Drift)",
            layer: "Layer 14 activation kurtosis cross >3.5σ threshold early",
            grads: [
              { name: "Layer 2", l2: 0.35, pct: 35, status: "normal" },
              { name: "Layer 8", l2: 0.65, pct: 50, status: "warning" },
              { name: "Layer 14", l2: 2.95, pct: 75, status: "alert" },
              { name: "Layer 18", l2: 0.45, pct: 35, status: "normal" },
            ],
          },
          {
            step: 43,
            loss: 3.65,
            cusum: 1.85,
            kurtosis: 22.4,
            status: "CUSUM DRIFT ALERT (Step 43)",
            layer: "Persistent loss rise (+0.48σ) confirmed in Block 14",
            grads: [
              { name: "Layer 2", l2: 0.85, pct: 45, status: "warning" },
              { name: "Layer 8", l2: 2.40, pct: 70, status: "alert" },
              { name: "Layer 14", l2: 8.50, pct: 95, status: "critical" },
              { name: "Layer 18", l2: 2.80, pct: 72, status: "alert" },
            ],
          },
          {
            step: 50,
            loss: 6.80,
            cusum: 5.40,
            kurtosis: 55.0,
            status: "EARLY EXPLOSION CASCADE",
            layer: "Gradient explosion propagating through transformer layers",
            grads: [
              { name: "Layer 2", l2: 2.40, pct: 70, status: "alert" },
              { name: "Layer 8", l2: 8.50, pct: 92, status: "critical" },
              { name: "Layer 14", l2: 32.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 16.5, pct: 96, status: "critical" },
            ],
          },
          {
            step: 56,
            loss: 9.90,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "FULL SPIKE COLLAPSE",
            layer: "Unrecoverable divergence triggered 4 steps early",
            grads: [
              { name: "Layer 2", l2: 18.0, pct: 95, status: "critical" },
              { name: "Layer 8", l2: 65.0, pct: 99, status: "critical" },
              { name: "Layer 14", l2: 210.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 120.0, pct: 100, status: "critical" },
            ],
          },
          {
            step: 60,
            loss: 9.90,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "NaN COLLAPSE",
            layer: "NaN parameters",
            grads: [
              { name: "Layer 2", l2: 22.0, pct: 96, status: "critical" },
              { name: "Layer 8", l2: 80.0, pct: 100, status: "critical" },
              { name: "Layer 14", l2: 250.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 140.0, pct: 100, status: "critical" },
            ],
          },
        ],
      };
    } else {
      return {
        kurtosisAlertStep: 10,
        cusumAlertStep: 25,
        kurtosisLabel: "Kurtosis Fire (Step 10)",
        cusumLabel: "CUSUM Drift (Step 25)",
        points: [
          {
            step: 10,
            loss: 3.60,
            cusum: 0.40,
            kurtosis: 8.20,
            status: "IMMEDIATE KURTOSIS ALERT",
            layer: "Violent LR surge causes immediate heavy-tail activations",
            grads: [
              { name: "Layer 2", l2: 0.65, pct: 45, status: "warning" },
              { name: "Layer 8", l2: 1.20, pct: 55, status: "warning" },
              { name: "Layer 14", l2: 3.40, pct: 80, status: "alert" },
              { name: "Layer 18", l2: 0.85, pct: 50, status: "warning" },
            ],
          },
          {
            step: 25,
            loss: 5.80,
            cusum: 3.20,
            kurtosis: 35.0,
            status: "CUSUM SHIFT + EXPLOSION",
            layer: "Rapid divergence in Block 14 gradients",
            grads: [
              { name: "Layer 2", l2: 1.80, pct: 65, status: "alert" },
              { name: "Layer 8", l2: 5.60, pct: 85, status: "critical" },
              { name: "Layer 14", l2: 22.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 11.0, pct: 92, status: "critical" },
            ],
          },
          {
            step: 43,
            loss: 9.85,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "TOTAL LOSS EXPLOSION",
            layer: "Full numerical collapse at step 43",
            grads: [
              { name: "Layer 2", l2: 15.0, pct: 92, status: "critical" },
              { name: "Layer 8", l2: 55.0, pct: 99, status: "critical" },
              { name: "Layer 14", l2: 190.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 98.0, pct: 100, status: "critical" },
            ],
          },
          {
            step: 50,
            loss: 9.85,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "NaN COLLAPSE",
            layer: "Model weights corrupted",
            grads: [
              { name: "Layer 2", l2: 20.0, pct: 95, status: "critical" },
              { name: "Layer 8", l2: 70.0, pct: 100, status: "critical" },
              { name: "Layer 14", l2: 230.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 120.0, pct: 100, status: "critical" },
            ],
          },
          {
            step: 56,
            loss: 9.85,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "NaN COLLAPSE",
            layer: "Model weights corrupted",
            grads: [
              { name: "Layer 2", l2: 20.0, pct: 95, status: "critical" },
              { name: "Layer 8", l2: 70.0, pct: 100, status: "critical" },
              { name: "Layer 14", l2: 230.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 120.0, pct: 100, status: "critical" },
            ],
          },
          {
            step: 60,
            loss: 9.85,
            cusum: 11.2,
            kurtosis: 95.0,
            status: "NaN COLLAPSE",
            layer: "Model weights corrupted",
            grads: [
              { name: "Layer 2", l2: 20.0, pct: 95, status: "critical" },
              { name: "Layer 8", l2: 70.0, pct: 100, status: "critical" },
              { name: "Layer 14", l2: 230.0, pct: 100, status: "critical" },
              { name: "Layer 18", l2: 120.0, pct: 100, status: "critical" },
            ],
          },
        ],
      };
    }
  };

  const currentProfile = getSimulationProfile(lrSurge);
  const lossPoints = currentProfile.points;

  // Convert step (10-60) and value to SVG coordinates (viewBox 0 0 580 180)
  // Strictly clamp value to [minV, maxV] so curves never exceed chart bounds!
  const getSvgCoords = (step: number, val: number, minV = 1.0, maxV = 10.0) => {
    const x = 50 + ((step - 10) / 50) * 465;
    const clamped = Math.max(minV, Math.min(maxV, val));
    const y = 145 - ((clamped - minV) / (maxV - minV)) * 105;
    return { x, y };
  };

  // Smooth Catmull-Rom / Monotone cubic bezier spline generator
  const getCurvedPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const lossPointsCoords = lossPoints.map((p) => getSvgCoords(p.step, p.loss, 1.0, 10.0));
  const kurtosisPointsCoords = lossPoints.map((p) => getSvgCoords(p.step, p.kurtosis, 0, 100));
  const cusumPointsCoords = lossPoints.map((p) => getSvgCoords(p.step, p.cusum, 0, 12));

  const lossPathD = getCurvedPath(lossPointsCoords);
  const kurtosisPathD = getCurvedPath(kurtosisPointsCoords);
  const cusumPathD = getCurvedPath(cusumPointsCoords);

  const firstLoss = lossPointsCoords[0];
  const lastLoss = lossPointsCoords[lossPointsCoords.length - 1];
  const areaD = `${lossPathD} L ${lastLoss.x} 145 L ${firstLoss.x} 145 Z`;

  const activePoint = lossPoints.find((p) => p.step === hoverStep) || lossPoints[2];
  const activeCoord = getSvgCoords(activePoint.step, activePoint.loss, 1.0, 10.0);

  const kurtosisAlertX = 50 + ((currentProfile.kurtosisAlertStep - 10) / 50) * 465;
  const cusumAlertX = 50 + ((currentProfile.cusumAlertStep - 10) / 50) * 465;

  return (
    <div className="border border-line bg-paper p-5 sm:p-7 font-mono w-full">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2 h-2 bg-accent-deep" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink font-medium">
            System Architecture & Flight Recorder
          </span>
        </div>

        {/* Mode Tab Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setMode("trainscope")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "trainscope"
                ? "border-accent-deep bg-accent-deep text-white font-medium"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            01 Trainscope Recorder
          </button>
          <button
            onClick={() => setMode("cerata")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "cerata"
                ? "border-ink bg-ink text-paper font-medium"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            02 CERATA
          </button>
        </div>
      </div>

      {/* Mode 1: CERATA (one fixed address space, three time scales) */}
      {mode === "cerata" && (
        <div className="space-y-6">
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-serif">
            Learning after deployment: one fixed address space, three time scales.
          </p>

          {/* ---- Architecture schematic ---- */}
          <div className="border border-line bg-paper-dim/40 p-4 sm:p-5">
            {/* Stage 1: frozen base */}
            <div className="flex justify-center">
              <div className="w-full sm:w-3/4 border border-line bg-paper px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted">Frozen base</span>
                  <span className="text-[10px] font-mono text-muted">content-hashed · immutable</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Backbone: frozen, never trained
                </div>
              </div>
            </div>

            <Connector label="emits h at the chosen layer" />

            {/* Stage 2: fixed address (key) */}
            <div className="flex justify-center">
              <div className="w-full sm:w-3/4 border-2 border-ink bg-ink text-paper px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Fixed address</span>
                  <span className="text-[10px] font-mono opacity-70">key</span>
                </div>
                <div className="text-sm font-semibold font-mono mt-1">h = hidden state at chosen layer</div>
                <div className="text-[10px] mt-0.5 opacity-75">keys are never trained</div>
              </div>
            </div>

            <Connector label="retrieval over fixed addresses" />

            {/* Stage 3: parameter-free retrieval + router */}
            <div className="flex justify-center">
              <div className="w-full sm:w-3/4 border border-line border-l-2 border-l-accent-deep bg-paper px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-accent-deep">
                    Router · on retrieval path
                  </span>
                  <span className="text-[10px] font-mono text-muted">0 trainable scalars</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Parameter-free retrieval · exact cosine
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 border border-line bg-paper-dim text-ink-soft">prototype</span>
                  <span className="px-1.5 py-0.5 border border-line bg-paper-dim text-ink-soft">ridge_class</span>
                  <span className="px-1.5 py-0.5 border border-accent-deep/40 bg-accent-deep/5 text-accent-deep">
                    purity asserted at runtime
                  </span>
                </div>
              </div>
            </div>

            {/* Fan-out into the three guarded lanes */}
            <div className="pt-1 px-3 sm:px-4">
              <div className="hidden md:grid grid-cols-3 gap-3 text-center text-muted" aria-hidden="true">
                <span className="text-[11px] leading-none">▼</span>
                <span className="text-[11px] leading-none">▼</span>
                <span className="text-[11px] leading-none">▼</span>
              </div>
              <div className="md:hidden text-center text-muted" aria-hidden="true">
                <span className="text-[11px] leading-none">▼</span>
              </div>
              <div className="text-center text-[9px] uppercase tracking-[0.14em] font-mono text-muted pt-0.5">
                branches into three time scales
              </div>
            </div>

            {/* Guards envelope: wraps every write / forget / consolidate */}
            <div className="border-2 border-dashed border-accent-deep/50 bg-accent-deep/5 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-accent-deep font-medium">
                  Guards · every write / forget / consolidate
                </span>
                <span className="text-[10px] font-mono text-muted">tolerance 1e-10</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {cerataGuards.map((g) => (
                    <span
                      key={g.n}
                      title={g.check}
                      className="px-1.5 py-0.5 border border-accent-deep/40 bg-paper text-accent-deep cursor-help"
                    >
                      {g.n} {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {cerataLanes.map((lane) => {
                  const isActive = cerataScale === lane.id;
                  return (
                    <button
                      key={lane.id}
                      onClick={() => { setCerataScale(lane.id); setActiveCard(0); }}
                      aria-pressed={isActive}
                      className={`text-left p-3.5 border transition-all cursor-pointer ${
                        isActive
                          ? "border-ink bg-ink text-paper shadow-sm"
                          : "border-line bg-paper text-ink hover:border-ink-soft hover:bg-paper-dim"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] uppercase tracking-wider mb-2 opacity-80">
                        <span>{lane.tab}</span>
                        <span>{lane.sub}</span>
                      </div>
                      <div className="text-xs font-semibold">{lane.title}</div>
                      <div className="mt-2 space-y-0.5 font-mono text-[10px] leading-relaxed">
                        {lane.mechanics.map((m) => (
                          <div key={m} className={isActive ? "text-paper/80" : "text-muted"}>{m}</div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5 font-mono text-[10px]">
                        {lane.api.map((a) => (
                          <span
                            key={a}
                            className={`px-1.5 py-0.5 border ${
                              isActive ? "border-paper/40 text-paper" : "border-line bg-paper-dim text-accent-deep"
                            }`}
                          >
                            {a}()
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Connector label="all paths converge → prediction" />

            {/* Stage 4: readout */}
            <div className="flex justify-center">
              <div className="w-full sm:w-3/4 border border-line bg-paper px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted">Readout</span>
                  <span className="text-[10px] font-mono text-muted">predict(x) · state()</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Prediction: labels, logits, routed expert ids, source
                </div>
              </div>
            </div>
          </div>

          {/* ---- Spec Inspector ---- */}
          <div className="border-t border-line pt-4 bg-paper-dim/60 p-4 sm:p-5 border-l-2 border-l-accent-deep text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{activeCardData.name}</span>
              <span className="text-[10px] text-accent-deep uppercase tracking-widest px-2 py-0.5 bg-accent-deep/10 font-mono">
                Spec Inspector · {currentScale?.tab}
              </span>
            </div>

            {/* Mechanism sub-selector for the selected scale */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              {currentCards.map((card, idx) => (
                <button
                  key={card.name}
                  onClick={() => setActiveCard(idx)}
                  aria-pressed={activeCard === idx}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    activeCard === idx ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  {card.metric}
                </button>
              ))}
            </div>

            <p className="text-ink-soft leading-relaxed font-serif text-sm">{activeCardData.desc}</p>
            <div className="p-2.5 bg-paper border border-line font-mono text-[11px] text-accent-deep">
              Formula: {activeCardData.formula}
            </div>
            <div className="text-[11px] text-muted font-mono flex flex-wrap gap-6">
              {activeCardData.specs.map((spec) => (
                <span key={spec}>{spec}</span>
              ))}
            </div>
            <div className="text-[11px] text-muted font-mono pt-2 border-t border-line/60">
              latent: 768 · tolerance: 1e-10 · storage: 5.3 MB/task · guards: 4
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Trainscope Multi-Signal Flight Recorder */}
      {mode === "trainscope" && (
        <div className="space-y-6">
          {/* Controls Bar & Scrub Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-line pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-ink-soft font-serif">
                Simulate LR Surge:
              </p>
              <div className="flex gap-1 font-mono text-[10px]">
                <button
                  onClick={() => { setLrSurge("1.0"); setHoverStep(43); }}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    lrSurge === "1.0" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  1.0x (Nominal)
                </button>
                <button
                  onClick={() => { setLrSurge("2.5"); setHoverStep(25); }}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    lrSurge === "2.5" ? "border-accent-deep bg-accent-deep text-white" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  2.5x (Drift)
                </button>
                <button
                  onClick={() => { setLrSurge("5.0"); setHoverStep(10); }}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    lrSurge === "5.0" ? "border-accent-deep bg-accent-deep text-white font-bold" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  5.0x (Spike)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {lossPoints.map((p) => (
                <button
                  key={p.step}
                  onClick={() => setHoverStep(p.step)}
                  className={`px-2.5 py-1 border cursor-pointer transition-all ${
                    hoverStep === p.step
                      ? p.step >= currentProfile.kurtosisAlertStep
                        ? "border-accent-deep bg-accent-deep text-white font-bold"
                        : "border-ink bg-ink text-paper font-bold"
                      : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  s{p.step}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Signal SVG Chart */}
          <div className="relative border border-line bg-paper p-4 overflow-hidden w-full">
            {/* Chart Legend */}
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider text-muted mb-2 font-mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-ink inline-block" /> Loss ℒ(t)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted inline-block stroke-dashed" /> Kurtosis κ(t)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent-deep inline-block stroke-dashed" /> CUSUM S_k</span>
            </div>

            <svg viewBox="0 0 580 180" className="w-full h-52 select-none">
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b02424" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#b02424" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Value Labels & Grid Lines */}
              <text x="42" y="43" fill="#7a776b" fontSize="8" fontFamily="monospace" textAnchor="end">10.0</text>
              <line x1="48" y1="40" x2="520" y2="40" stroke="#d8d4c5" strokeDasharray="3 3" />

              <text x="42" y="95" fill="#7a776b" fontSize="8" fontFamily="monospace" textAnchor="end">5.0</text>
              <line x1="48" y1="92" x2="520" y2="92" stroke="#d8d4c5" strokeDasharray="3 3" />

              <text x="42" y="148" fill="#7a776b" fontSize="8" fontFamily="monospace" textAnchor="end">1.0</text>
              <line x1="48" y1="145" x2="520" y2="145" stroke="#d8d4c5" strokeWidth="1" />

              {/* Dynamic Early Warning Trigger Lines */}
              <line x1={kurtosisAlertX} y1="24" x2={kurtosisAlertX} y2="145" stroke="#646156" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x={kurtosisAlertX} y="16" fill="#646156" fontSize="8.5" fontWeight="bold" textAnchor={kurtosisAlertX > 300 ? "end" : "start"}>
                {currentProfile.kurtosisLabel}
              </text>

              <line x1={cusumAlertX} y1="32" x2={cusumAlertX} y2="145" stroke="#b02424" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x={cusumAlertX} y="26" fill="#b02424" fontSize="8.5" fontWeight="bold" textAnchor={cusumAlertX > 400 ? "end" : "start"}>
                {currentProfile.cusumLabel}
              </text>

              {/* Tracking Guide Line for Hovered Step */}
              <line x1={activeCoord.x} y1="40" x2={activeCoord.x} y2="145" stroke="#d8d4c5" strokeDasharray="1 2" strokeWidth="1" />

              {/* Smooth Curves & Area Fill */}
              <path d={areaD} fill="url(#lossGradient)" />
              <path d={kurtosisPathD} fill="none" stroke="#646156" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d={cusumPathD} fill="none" stroke="#b02424" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d={lossPathD} fill="none" stroke="#161513" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Points with Mobile Touch Radius */}
              {lossPoints.map((p) => {
                const { x, y } = getSvgCoords(p.step, p.loss, 1.0, 10.0);
                const isSelected = p.step === hoverStep;
                const isSpike = p.step >= currentProfile.kurtosisAlertStep;

                return (
                  <g key={p.step} className="cursor-pointer" onClick={() => setHoverStep(p.step)}>
                    {/* Transparent touch area for mobile fingers */}
                    <circle cx={x} cy={y} r="16" fill="transparent" />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "5.5" : "3.5"}
                      fill={isSpike ? "#b02424" : "#161513"}
                    />
                    {isSelected && (
                      <circle cx={x} cy={y} r="8.5" fill="none" stroke={isSpike ? "#b02424" : "#161513"} strokeWidth="1.5" />
                    )}
                    <text x={x} y="162" fill="#7a776b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      s{p.step}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Diagnostics Panel: Layer L2 Heatmap & Chronological Story */}
          <div className="grid md:grid-cols-12 gap-4">
            {/* Left: Selected Step Story */}
            <div className="md:col-span-6 border-l-2 border-accent-deep bg-paper-dim/60 p-4 text-xs space-y-2 border border-line border-l-accent-deep">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-accent-deep text-sm">Step {activePoint.step} · {activePoint.status}</span>
                <span className="text-muted font-mono text-xs">Loss: {activePoint.loss.toFixed(2)}</span>
              </div>
              <p className="text-ink-soft font-serif text-sm">Mechanism Story: <span className="font-medium text-ink font-mono">{activePoint.layer}</span></p>
              <div className="text-[11px] text-muted font-mono flex flex-wrap gap-4 pt-1">
                <span>CUSUM S_k: {activePoint.cusum.toFixed(2)}σ</span>
                <span>Kurtosis: {activePoint.kurtosis.toFixed(1)}</span>
                <span>Storage: Arrow IPC</span>
              </div>
            </div>

            {/* Right: Per-Layer Gradient L2 Inspector */}
            <div className="md:col-span-6 border border-line bg-paper-dim/60 p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted uppercase tracking-wider">
                <span>Per-Block Gradient L2 Norm</span>
                <span>Step {activePoint.step}</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] pt-1">
                {activePoint.grads.map((g) => (
                  <div key={g.name} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-muted">{g.name}</span>
                    <div className="flex-1 bg-paper border border-line h-3 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          g.status === "critical"
                            ? "bg-accent-deep"
                            : g.status === "alert"
                            ? "bg-accent"
                            : g.status === "warning"
                            ? "bg-ink/70"
                            : "bg-line"
                        }`}
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-muted tabular-nums font-semibold">{g.l2.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
