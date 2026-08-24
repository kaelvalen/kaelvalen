"use client";

import { useState } from "react";

type Mode = "engram" | "trainscope";

export default function ArchitectureDiagram() {
  const [mode, setMode] = useState<Mode>("engram");
  const [pattern, setPattern] = useState<"ssd_gdr" | "ssd_swa" | "mom">("ssd_gdr");
  const [activeBlock, setActiveBlock] = useState<number>(0);
  const [hoverStep, setHoverStep] = useState<number>(43);

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

  // Trainscope loss curve key points (step, loss, cusum, kurtosis, status, layerGrads)
  const lossPoints = [
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
      loss: 2.85,
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
      loss: 2.41,
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
      loss: 2.48,
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
      loss: 3.12,
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
      // Scale kurtosis (3.0 - 95.0) to Y space
      const { x, y } = getSvgCoords(p.step, p.kurtosis, 0, 100);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const cusumPathD = lossPoints
    .map((p, i) => {
      // Scale cusum (0.0 - 12.0) to Y space
      const { x, y } = getSvgCoords(p.step, p.cusum, 0, 12);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const lastCoord = getSvgCoords(60, 9.84);
  const areaD = `${lossPathD} L ${lastCoord.x} 145 L 45 145 Z`;

  const activePoint = lossPoints.find((p) => p.step === hoverStep) || lossPoints[2];

  return (
    <div className="my-10 border border-line bg-paper-dim/40 p-5 sm:p-7 font-mono w-full">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-deep animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink font-medium">
            Interactive System Architecture & Flight Recorder
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setMode("engram")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "engram"
                ? "border-accent-deep bg-paper text-accent-deep font-medium shadow-sm"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            [01] ENGRAM Backbone (SSD + GDR + MoM)
          </button>
          <button
            onClick={() => setMode("trainscope")}
            className={`px-3.5 py-1.5 border transition-all cursor-pointer ${
              mode === "trainscope"
                ? "border-accent-deep bg-paper text-accent-deep font-medium shadow-sm"
                : "border-line text-muted hover:text-ink hover:border-ink-soft"
            }`}
          >
            [02] Trainscope (Flight Recorder UI)
          </button>
        </div>
      </div>

      {/* Mode 1: ENGRAM Hybrid Blocks */}
      {mode === "engram" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-serif">
              Interleaved sequence backbone architecture. Select layer pattern (`block_pattern` config):
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
                  pattern === "mom" ? "border-amber-700 bg-amber-700 text-white" : "border-line bg-paper text-muted hover:text-ink"
                }`}
              >
                MoM Router
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentBlocks.map((blk, idx) => {
              const isActive = activeBlock === idx;
              const isGDR = blk.type === "GDR";
              const isSWA = blk.type === "SWA";
              const isMoM = blk.type === "MoM";
              return (
                <button
                  key={idx}
                  onClick={() => setActiveBlock(idx)}
                  className={`p-3.5 text-left border transition-all cursor-pointer ${
                    isActive
                      ? isMoM
                        ? "border-amber-700 bg-amber-700 text-white shadow-md transform -translate-y-0.5"
                        : isSWA
                        ? "border-blue-700 bg-blue-700 text-white shadow-md transform -translate-y-0.5"
                        : isGDR
                        ? "border-accent-deep bg-accent-deep text-white shadow-md transform -translate-y-0.5"
                        : "border-ink bg-ink text-paper shadow-md transform -translate-y-0.5"
                      : isMoM
                      ? "border-amber-700/50 bg-amber-700/10 text-amber-900 hover:border-amber-700"
                      : isSWA
                      ? "border-blue-700/40 bg-blue-700/5 text-blue-900 hover:border-blue-700"
                      : isGDR
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
          <div className="border-t border-line pt-4 bg-paper/80 p-4 sm:p-5 border-l-2 border-l-accent-deep text-xs space-y-2">
            <div className="flex justify-between items-center font-medium text-ink">
              <span className="text-sm font-semibold">{activeBlockData.name}</span>
              <span className="text-[10px] text-accent-deep uppercase tracking-widest px-2 py-0.5 bg-accent-deep/10 font-mono">
                Tensor Inspector
              </span>
            </div>
            <p className="text-ink-soft leading-relaxed font-serif text-sm">{activeBlockData.desc}</p>
            <div className="p-2.5 bg-paper-dim/80 border border-line/60 font-mono text-[11px] text-accent-deep">
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
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed font-serif">
              Post-mortem flight recorder: scrub timeline steps to inspect CUSUM drift (0.10σ-0.25σ) & Kurtosis early signals:
            </p>
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {lossPoints.map((p) => (
                <button
                  key={p.step}
                  onClick={() => setHoverStep(p.step)}
                  className={`px-2 py-1 border cursor-pointer transition-all ${
                    hoverStep === p.step
                      ? p.step === 43
                        ? "border-amber-700 bg-amber-700 text-white font-bold"
                        : p.step >= 50
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
            <div className="flex items-center gap-5 text-[10px] uppercase tracking-wider text-muted mb-2 font-mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-ink inline-block" /> Loss ℒ(t)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-700 inline-block stroke-dashed" /> Kurtosis κ(t)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent-deep inline-block stroke-dashed" /> CUSUM S_k</span>
            </div>

            <svg viewBox="0 0 580 170" className="w-full h-48">
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e53e3e" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#e53e3e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="45" y1="30" x2="515" y2="30" stroke="#d8d4c5" strokeDasharray="3 3" />
              <line x1="45" y1="85" x2="515" y2="85" stroke="#d8d4c5" strokeDasharray="3 3" />
              <line x1="45" y1="145" x2="515" y2="145" stroke="#d8d4c5" strokeWidth="1" />

              {/* Early warning markers with staggered Y offsets */}
              {/* Kurtosis at step 43 -> x=351.9 */}
              <line x1="351.9" y1="18" x2="351.9" y2="145" stroke="#b25e00" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x="351.9" y="12" fill="#b25e00" fontSize="8.5" fontWeight="bold" textAnchor="end">Kurtosis Fire (16.7s lead)</text>

              {/* CUSUM at step 50 -> x=417 */}
              <line x1="417" y1="28" x2="417" y2="145" stroke="#e53e3e" strokeDasharray="2 2" strokeWidth="1.5" />
              <text x="417" y="24" fill="#e53e3e" fontSize="8.5" fontWeight="bold" textAnchor="start">CUSUM Fire (9.7s lead)</text>

              {/* Loss Area & Paths */}
              <path d={areaD} fill="url(#lossGradient)" />
              <path d={kurtosisPathD} fill="none" stroke="#b25e00" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d={cusumPathD} fill="none" stroke="#e53e3e" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d={lossPathD} fill="none" stroke="#161513" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Points */}
              {lossPoints.map((p) => {
                const { x, y } = getSvgCoords(p.step, p.loss);
                const isSelected = p.step === hoverStep;
                const isSpike = p.step >= 43;

                return (
                  <g key={p.step} className="cursor-pointer" onClick={() => setHoverStep(p.step)}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "5.5" : "3.5"}
                      fill={p.step === 43 ? "#b25e00" : isSpike ? "#e53e3e" : "#161513"}
                    />
                    {isSelected && (
                      <circle cx={x} cy={y} r="8.5" fill="none" stroke={p.step === 43 ? "#b25e00" : "#e53e3e"} strokeWidth="1.5" />
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
            <div className="md:col-span-6 border-l-2 border-accent-deep bg-paper/80 p-4 text-xs space-y-2">
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
            <div className="md:col-span-6 border border-line bg-paper/80 p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono text-muted uppercase tracking-wider">
                <span>Per-Block Gradient L2 Norm</span>
                <span>Step {activePoint.step}</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] pt-1">
                {activePoint.grads.map((g) => (
                  <div key={g.name} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-muted">{g.name}</span>
                    <div className="flex-1 bg-paper-dim border border-line/60 h-3 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          g.status === "critical"
                            ? "bg-accent-deep"
                            : g.status === "alert"
                            ? "bg-accent"
                            : g.status === "warning"
                            ? "bg-amber-600"
                            : "bg-ink/40"
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
