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
