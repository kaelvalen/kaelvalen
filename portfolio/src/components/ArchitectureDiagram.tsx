"use client";

import { useState } from "react";

type Mode = "engram" | "trainscope";

export default function ArchitectureDiagram() {
  const [mode, setMode] = useState<Mode>("engram");
  const [pattern, setPattern] = useState<"ssd_gdr" | "ssd_swa" | "mom">("ssd_gdr");
  const [activeBlock, setActiveBlock] = useState<number>(0);
  const [hoverStep, setHoverStep] = useState<number>(43);
  const [lrSurge, setLrSurge] = useState<"1.0" | "2.5" | "5.0">("1.0");

  const patterns = {
    ssd_gdr: [
      { type: "SSD", name: "Mamba-2 SSD Layer 1", desc: "Structured State Space Duality · Scalar-per-head decay A(t) with per-channel state & selective Δ/B/C.", formula: "h_t = A_t h_{t-1} + B_t x_t,  y_t = C_t h_t", ratio: "3:1 ratio" },
      { type: "SSD", name: "Mamba-2 SSD Layer 2", desc: "Structured State Space Duality · Triton associative scan kernel with exact fp64 streaming equivalence.", formula: "associative_scan(A_t, B_t x_t)", ratio: "3:1 ratio" },
      { type: "SSD", name: "Mamba-2 SSD Layer 3", desc: "Structured State Space Duality · Multi-head 1D Conv + selective state passing.", formula: "y_t = Conv1D(x_t) ⊗ StateScan(A_t, B_t, C_t)", ratio: "3:1 ratio" },
      { type: "GDR", name: "Gated Delta Rule Layer 4", desc: "Associative Delta Memory · Data-dependent write/forget gates with targeted recall & overwrite.", formula: "S_t = S_{t-1} + k_t (v_t - k_t^T S_{t-1})", ratio: "Mixer Interleave" },
    ],
    ssd_swa: [
      { type: "SSD", name: "Mamba-2 SSD Layer 1", desc: "Structured State Space Duality · Fast state space scan backbone.", formula: "h_t = A_t h_{t-1} + B_t x_t", ratio: "3:1 ratio" },
      { type: "SSD", name: "Mamba-2 SSD Layer 2", desc: "Structured State Space Duality · Parallel associative scan.", formula: "associative_scan(A_t, B_t x_t)", ratio: "3:1 ratio" },
      { type: "SSD", name: "Mamba-2 SSD Layer 3", desc: "Structured State Space Duality · Selective state passing.", formula: "y_t = C_t h_t", ratio: "3:1 ratio" },
      { type: "SWA", name: "Sliding Window Attention (SWAState)", desc: "RoPE Attention with real streaming KV-cache · Chunked/token-by-token decode bit-exact with full forward.", formula: "Attention(Q, K, V) ⊗ SWAState(window=256)", ratio: "H1 Hybrid" },
    ],
    mom: [
      { type: "SSD", name: "Mamba-2 SSD Primitive", desc: "Compressed recurrent state space primitive for smooth sequences.", formula: "h_t = A_t h_{t-1} + B_t x_t", ratio: "Expert 1" },
      { type: "GDR", name: "Gated Delta Primitive", desc: "Associative delta memory primitive for targeted key-value overwrite.", formula: "S_t = S_{t-1} + k_t (v_t - k_t^T S_{t-1})", ratio: "Expert 2" },
      { type: "SWA", name: "SWA Attention Primitive", desc: "Exact streaming KV-cache attention primitive for surprising tokens.", formula: "Attention(Q, K, V)", ratio: "Expert 3" },
      { type: "MoM", name: "MoM Surprise Router (mom/)", desc: "Mixture of Memory Primitives · Per-token surprise-gated router deciding primitive allocation.", formula: "g_t = σ(W_s · surprise_signal(t) + W_x x_t)", ratio: "Surprise Gate" },
    ],
  };

  const currentBlocks = patterns[pattern];
  const activeBlockData = currentBlocks[activeBlock] || currentBlocks[0];

  const surgeMult = parseFloat(lrSurge);

  // Trainscope loss curve key points (step, loss, cusum, kurtosis, status, layerGrads)
  const lossPoints = [
    {
      step: 10,
      loss: 3.42 * (surgeMult > 3 ? 1.4 : 1.0),
      cusum: 0.02 * surgeMult,
      kurtosis: 3.01 * (surgeMult > 3 ? 2.5 : 1.0),
      status: surgeMult > 3 ? "KURTOSIS EARLY SPIKE (Step 10)" : "Normal Steady State",
      layer: "All layers operating within nominal gradients (L2 ≈ 0.12)",
      grads: [
        { name: "Layer 2", l2: 0.12 * surgeMult, pct: Math.min(100, 15 * surgeMult), status: surgeMult > 3 ? "warning" : "normal" },
        { name: "Layer 8", l2: 0.18 * surgeMult, pct: Math.min(100, 20 * surgeMult), status: surgeMult > 3 ? "warning" : "normal" },
        { name: "Layer 14", l2: 0.15 * surgeMult, pct: Math.min(100, 18 * surgeMult), status: surgeMult > 3 ? "alert" : "normal" },
        { name: "Layer 18", l2: 0.11 * surgeMult, pct: Math.min(100, 14 * surgeMult), status: "normal" },
      ],
    },
    {
      step: 25,
      loss: 2.85 * (surgeMult > 1.5 ? 1.6 : 1.0),
      cusum: 0.08 * surgeMult,
      kurtosis: 3.12 * (surgeMult > 1.5 ? 3.2 : 1.0),
      status: surgeMult > 1.5 ? "CUSUM DRIFT ALERT (Step 25)" : "Normal Steady State",
      layer: "Loss decreasing smoothly (L2 ≈ 0.18)",
      grads: [
        { name: "Layer 2", l2: 0.14 * surgeMult, pct: Math.min(100, 16 * surgeMult), status: "normal" },
        { name: "Layer 8", l2: 0.22 * surgeMult, pct: Math.min(100, 22 * surgeMult), status: "normal" },
        { name: "Layer 14", l2: 0.19 * surgeMult, pct: Math.min(100, 20 * surgeMult), status: surgeMult > 1.5 ? "alert" : "normal" },
        { name: "Layer 18", l2: 0.12 * surgeMult, pct: Math.min(100, 15 * surgeMult), status: "normal" },
      ],
    },
    {
      step: 43,
      loss: Math.min(9.8, 2.41 * surgeMult),
      cusum: 0.28 * surgeMult,
      kurtosis: 7.84 * surgeMult,
      status: "KURTOSIS ALERT (16.7 steps early warning)",
      layer: "Block 14 activation kurtosis spike (7.84 > 3.5 margin)",
      grads: [
        { name: "Layer 2", l2: 0.25 * surgeMult, pct: Math.min(100, 25 * surgeMult), status: "normal" },
        { name: "Layer 8", l2: 0.41 * surgeMult, pct: Math.min(100, 35 * surgeMult), status: "normal" },
        { name: "Layer 14", l2: 1.85 * surgeMult, pct: Math.min(100, 65 * surgeMult), status: "warning" },
        { name: "Layer 18", l2: 0.38 * surgeMult, pct: Math.min(100, 30 * surgeMult), status: "normal" },
      ],
    },
    {
      step: 50,
      loss: Math.min(9.9, 2.48 * (surgeMult > 1.5 ? 2.8 : 1.0)),
      cusum: 0.95 * surgeMult,
      kurtosis: 12.4 * surgeMult,
      status: "CUSUM DRIFT ALERT (9.7 steps early warning)",
      layer: "Persistent loss drift (+0.22σ) detected in Block 14",
      grads: [
        { name: "Layer 2", l2: 0.38 * surgeMult, pct: Math.min(100, 30 * surgeMult), status: "normal" },
        { name: "Layer 8", l2: 0.95 * surgeMult, pct: Math.min(100, 45 * surgeMult), status: "warning" },
        { name: "Layer 14", l2: 4.82 * surgeMult, pct: Math.min(100, 85 * surgeMult), status: "alert" },
        { name: "Layer 18", l2: 1.12 * surgeMult, pct: Math.min(100, 50 * surgeMult), status: "warning" },
      ],
    },
    {
      step: 56,
      loss: Math.min(9.95, 3.12 * (surgeMult > 1.5 ? 2.5 : 1.0)),
      cusum: 3.40 * surgeMult,
      kurtosis: 28.1 * surgeMult,
      status: "GRADIENT EXPLOSION CASCADE",
      layer: "Layer 14 L2 norm explosion (14.82) propagating to Layer 18",
      grads: [
        { name: "Layer 2", l2: 1.15 * surgeMult, pct: Math.min(100, 50 * surgeMult), status: "warning" },
        { name: "Layer 8", l2: 3.84 * surgeMult, pct: Math.min(100, 75 * surgeMult), status: "alert" },
        { name: "Layer 14", l2: 14.82 * surgeMult, pct: 100, status: "critical" },
        { name: "Layer 18", l2: 8.15 * surgeMult, pct: Math.min(100, 88 * surgeMult), status: "critical" },
      ],
    },
    {
      step: 60,
      loss: 9.84,
      cusum: 11.2 * surgeMult,
      kurtosis: 95.0 * surgeMult,
      status: "FULL SPIKE COLLAPSE",
      layer: "NaN parameters / Optimizer update corrupted",
      grads: [
        { name: "Layer 2", l2: 12.4 * surgeMult, pct: 90, status: "critical" },
        { name: "Layer 8", l2: 45.2 * surgeMult, pct: 98, status: "critical" },
        { name: "Layer 14", l2: 182.0 * surgeMult, pct: 100, status: "critical" },
        { name: "Layer 18", l2: 96.4 * surgeMult, pct: 99, status: "critical" },
      ],
    },
  ];

  // Convert step (10-60) and loss (2.0-10.0) to SVG coordinates (viewBox 0 0 580 170)
  const getSvgCoords = (step: number, val: number, minV = 2.0, maxV = 10.0) => {
    const x = 45 + ((step - 10) / 50) * 465;
    const y = 145 - ((val - minV) / (maxV - minV)) * 115;
    return { x, y };
  };

  const lossPathD = lossPoints
    .map((p, i) => {
      const { x, y } = getSvgCoords(p.step, p.loss);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const kurtosisPathD = lossPoints
    .map((p, i) => {
      const { x, y } = getSvgCoords(p.step, p.kurtosis, 0, 100);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const cusumPathD = lossPoints
    .map((p, i) => {
      const { x, y } = getSvgCoords(p.step, p.cusum, 0, 12);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const lastCoord = getSvgCoords(60, 9.84);
  const areaD = `${lossPathD} L ${lastCoord.x} 145 L 45 145 Z`;

  const activePoint = lossPoints.find((p) => p.step === hoverStep) || lossPoints[2];

  return (
    <div className="my-10 border border-line bg-paper p-5 sm:p-7 font-mono w-full">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-deep" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink font-medium">
            System Architecture & Flight Recorder
          </span>
        </div>

        {/* Mode Tab Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setMode("engram")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "engram"
                ? "border-ink bg-ink text-paper font-medium"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            01 ENGRAM Hybrid
          </button>
          <button
            onClick={() => setMode("trainscope")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "trainscope"
                ? "border-accent-deep bg-accent-deep text-white font-medium"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            02 Trainscope Recorder
          </button>
        </div>
      </div>

      {/* Mode 1: ENGRAM Hybrid Blocks */}
      {mode === "engram" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-serif">
              Interleaved sequence backbone architecture. Layer pattern config:
            </p>

            {/* Pattern Switcher */}
            <div className="flex gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => { setPattern("ssd_gdr"); setActiveBlock(0); }}
                className={`px-2.5 py-1 border cursor-pointer transition-all ${
                  pattern === "ssd_gdr" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
                }`}
              >
                SSD + GDR (3:1)
              </button>
              <button
                onClick={() => { setPattern("ssd_swa"); setActiveBlock(0); }}
                className={`px-2.5 py-1 border cursor-pointer transition-all ${
                  pattern === "ssd_swa" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
                }`}
              >
                SSD + SWA (H1)
              </button>
              <button
                onClick={() => { setPattern("mom"); setActiveBlock(3); }}
                className={`px-2.5 py-1 border cursor-pointer transition-all ${
                  pattern === "mom" ? "border-accent-deep bg-accent-deep text-white" : "border-line bg-paper text-muted hover:text-ink"
                }`}
              >
                MoM Router
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentBlocks.map((blk, idx) => {
              const isActive = activeBlock === idx;
              const isAccent = blk.type === "GDR" || blk.type === "MoM";
              return (
                <button
                  key={idx}
                  onClick={() => setActiveBlock(idx)}
                  className={`p-3.5 text-left border transition-all cursor-pointer ${
                    isActive
                      ? isAccent
                        ? "border-accent-deep bg-accent-deep text-white shadow-sm"
                        : "border-ink bg-ink text-paper shadow-sm"
                      : isAccent
                      ? "border-accent-deep/40 bg-accent-deep/5 text-accent-deep hover:border-accent-deep"
                      : "border-line bg-paper text-ink hover:border-ink-soft hover:bg-paper-dim"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider mb-2 opacity-80">
                    <span>{blk.type === "MoM" ? "Router" : `L${idx + 1}`}</span>
                    <span className={isActive ? "text-paper/80" : "text-muted"}>{blk.type}</span>
                  </div>
                  <div className="text-xs font-semibold">{blk.name}</div>
                  <div className="text-[10px] mt-1 opacity-75">{blk.ratio}</div>
                </button>
              );
            })}
          </div>

          {/* Active Block Spec Inspector */}
          <div className="border-t border-line pt-4 bg-paper-dim/60 p-4 sm:p-5 border-l-2 border-l-accent-deep text-xs space-y-2">
            <div className="flex justify-between items-center font-medium text-ink">
              <span className="text-sm font-semibold">{activeBlockData.name}</span>
              <span className="text-[10px] text-accent-deep uppercase tracking-widest px-2 py-0.5 bg-accent-deep/10 font-mono">
                Tensor Inspector
              </span>
            </div>
            <p className="text-ink-soft leading-relaxed font-serif text-sm">{activeBlockData.desc}</p>
            <div className="p-2.5 bg-paper border border-line font-mono text-[11px] text-accent-deep">
              Formula: {activeBlockData.formula}
            </div>
            <div className="text-[11px] text-muted font-mono pt-1 flex flex-wrap gap-6">
              <span>dim: 64</span>
              <span>heads: 4</span>
              <span>state: S_t ∈ ℝ^(64×64)</span>
              <span>numerical_test: bit-exact fp64</span>
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
                  onClick={() => setLrSurge("1.0")}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    lrSurge === "1.0" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  1.0x (Nominal)
                </button>
                <button
                  onClick={() => setLrSurge("2.5")}
                  className={`px-2 py-0.5 border cursor-pointer transition-all ${
                    lrSurge === "2.5" ? "border-accent-deep bg-accent-deep text-white" : "border-line bg-paper text-muted hover:text-ink"
                  }`}
                >
                  2.5x (Drift)
                </button>
                <button
                  onClick={() => setLrSurge("5.0")}
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
                      ? p.step >= 43
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

            <svg viewBox="0 0 580 170" className="w-full h-48">
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b02424" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#b02424" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="45" y1="30" x2="515" y2="30" stroke="#d8d4c5" strokeDasharray="3 3" />
              <line x1="45" y1="85" x2="515" y2="85" stroke="#d8d4c5" strokeDasharray="3 3" />
              <line x1="45" y1="145" x2="515" y2="145" stroke="#d8d4c5" strokeWidth="1" />

              {/* Early warning markers with staggered Y offsets */}
              {/* Kurtosis at step 43 -> x=351.9 */}
              <line x1="351.9" y1="18" x2="351.9" y2="145" stroke="#7a776b" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x="351.9" y="12" fill="#7a776b" fontSize="8.5" fontWeight="medium" textAnchor="end">Kurtosis Fire (16.7s lead)</text>

              {/* CUSUM at step 50 -> x=417 */}
              <line x1="417" y1="28" x2="417" y2="145" stroke="#b02424" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x="417" y="24" fill="#b02424" fontSize="8.5" fontWeight="medium" textAnchor="start">CUSUM Fire (9.7s lead)</text>

              {/* Loss Area & Paths */}
              <path d={areaD} fill="url(#lossGradient)" />
              <path d={kurtosisPathD} fill="none" stroke="#7a776b" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d={cusumPathD} fill="none" stroke="#b02424" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d={lossPathD} fill="none" stroke="#161513" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Points with Mobile Touch Radius */}
              {lossPoints.map((p) => {
                const { x, y } = getSvgCoords(p.step, p.loss);
                const isSelected = p.step === hoverStep;
                const isSpike = p.step >= 43;

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
                    <text x={x} y="160" fill="#7a776b" fontSize="9" fontFamily="monospace" textAnchor="middle">
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
