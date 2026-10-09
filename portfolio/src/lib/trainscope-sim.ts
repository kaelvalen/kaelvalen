export type SurgeKey = "1.0" | "2.5" | "5.0";
export type GradStatus = "normal" | "warning" | "alert" | "critical";

export type GradReading = { name: string; l2: number; pct: number; status: GradStatus };

export type SimPoint = {
  step: number;
  loss: number;
  cusum: number;
  kurtosis: number;
  status: string;
  layer: string;
  grads: GradReading[];
};

export type SimProfile = {
  kurtosisAlertStep: number;
  cusumAlertStep: number;
  kurtosisLabel: string;
  cusumLabel: string;
  points: SimPoint[];
};

export const DEFAULT_STEP: Record<SurgeKey, number> = { "1.0": 43, "2.5": 25, "5.0": 10 };

/** Simulated trainscope telemetry for 1.0x, 2.5x and 5.0x learning-rate surges. */
export function getSimulationProfile(surge: SurgeKey): SimProfile {
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
}
