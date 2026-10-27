/**
 * One-sided CUSUM on loss drift.
 *
 * A fast and a slow exponential average follow the loss. In healthy training the loss falls or
 * holds, so the fast average sits at or below the slow one; drift upward opens a positive gap. The
 * gap is standardised by the noise level, learnt from the loss's deviation from the fast average
 * while the detector is in control, and accumulated Page-style:
 *
 *   S₀ = 0,   Sₙ = max(0, Sₙ₋₁ + zₙ − k),   alarm when Sₙ > h.
 *
 * Defaults were chosen on the simulated runs in run-sim.ts: no false alarm in 300 nominal runs of
 * 400 steps, and an alarm before the spike at every surge from 1.3× to 5× (see tests/cusum.test.ts).
 */

export type CusumConfig = {
  /** Smoothing of the fast and slow averages. */
  fast: number;
  slow: number;
  /** Allowance per step, in noise units. */
  k: number;
  /** Decision threshold. */
  h: number;
  /** Steps used only to learn the noise level. */
  warmup: number;
};

export const DEFAULT_CUSUM: CusumConfig = { fast: 0.3, slow: 0.03, k: 1, h: 8, warmup: 40 };

export type CusumReading = { fast: number; slow: number; z: number; s: number; alarm: boolean };

export class CusumDetector {
  readonly config: CusumConfig;
  private n = 0;
  private f = 0;
  private sl = 0;
  private v = 0;
  private s = 0;

  constructor(config: CusumConfig = DEFAULT_CUSUM) {
    this.config = config;
  }

  push(x: number): CusumReading {
    const { fast, slow, k, h, warmup } = this.config;
    this.n++;
    if (this.n === 1) {
      this.f = this.sl = x;
      return { fast: x, slow: x, z: 0, s: 0, alarm: false };
    }
    this.f = fast * x + (1 - fast) * this.f;
    this.sl = slow * x + (1 - slow) * this.sl;
    const e = x - this.f;
    if (this.n === 2) this.v = e * e;
    // Learn the noise only while in control, so drift does not inflate its own yardstick.
    if (this.n <= warmup || this.s === 0) this.v = 0.97 * this.v + 0.03 * e * e;
    // Standard deviation of the gap's noise: an EWMA of white noise has variance σ²·α/(2−α).
    const sd = Math.sqrt(this.v) * Math.sqrt(fast / (2 - fast)) || 1e-9;
    const z = (this.f - this.sl) / sd;
    if (this.n > warmup) this.s = Math.max(0, this.s + z - k);
    return { fast: this.f, slow: this.sl, z, s: this.s, alarm: this.s > h };
  }
}
