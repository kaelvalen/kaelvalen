/**
 * A simulated training run, mid-way through: the loss declines slowly toward a plateau, with
 * noise that shrinks as the loss does. Raising the learning rate starts a drift that grows
 * super-linearly from the moment of the change until the run diverges. Per-block gradient norms
 * follow the drift with a lead/lag per block, so the recorder can name the block that moved first.
 *
 * Only the telemetry is simulated. The detector that watches it (cusum.ts) is the real thing.
 */

export const BLOCKS = ["embed", "attn.0", "attn.1", "attn.2", "attn.3", "mlp.3", "head"] as const;
/** How strongly each block feels the drift; attn.3 moves first. */
const SENSITIVITY = [0.15, 0.25, 0.35, 0.6, 1.6, 1.1, 0.4];

export const NOISE = 0.045;
/** Loss above the reference by this much is a spike: about 13σ. */
export const SPIKE = 0.6;

export type SimStep = { step: number; loss: number; reference: number; grads: number[]; spike: boolean };

/** xorshift32 → standard normal (Box–Muller). Deterministic per seed. */
export function gaussian(seed: number) {
  let s = seed >>> 0 || 1;
  const u = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  return () => Math.sqrt(-2 * Math.log(u() + 1e-12)) * Math.cos(2 * Math.PI * u());
}

export const reference = (step: number) => 1.6 + 0.9 * Math.exp(-step / 700);

export class TrainingRun {
  step = 0;
  private lr = 1;
  private onset: number | null = null;
  private noise: () => number;

  constructor(seed: number) {
    this.noise = gaussian(seed);
  }

  /** Sets the learning-rate multiplier. Drift starts the first time it leaves 1×. */
  setLearningRate(x: number) {
    if (x > 1 && this.lr <= 1 && this.onset === null) this.onset = this.step;
    if (x <= 1) this.onset = null;
    this.lr = x;
  }

  drift(step: number) {
    if (this.onset === null || step <= this.onset) return 0;
    return (this.lr - 1) * 0.0012 * Math.pow(step - this.onset, 1.55);
  }

  next(): SimStep {
    const step = this.step++;
    const ref = reference(step);
    const d = this.drift(step);
    const loss = ref + d + this.noise() * NOISE * (0.6 + (0.4 * ref) / 2.5);
    const grads = SENSITIVITY.map((k) => Math.max(0.05, 1 + k * d * 6 + this.noise() * 0.04));
    return { step, loss, reference: ref, grads, spike: loss > ref + SPIKE };
  }
}
