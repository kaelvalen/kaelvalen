/*
 * The flight recorder, off the main thread: a simulated run streams steps into the real CUSUM
 * detector, and every reading is posted to the figure. At 20 steps a second the page never does the
 * arithmetic itself; it only draws.
 */
import { CusumDetector } from "@/lib/cusum";
import { TrainingRun } from "@/lib/run-sim";

export type Reading = {
  step: number;
  loss: number;
  reference: number;
  s: number;
  alarm: boolean;
  spike: boolean;
  grads: number[];
};

export type ToRecorder =
  | { type: "start"; seed: number; streaming: boolean }
  | { type: "lr"; value: number }
  | { type: "play" }
  | { type: "pause" };

export type FromRecorder =
  | { type: "reset"; readings: Reading[]; lr: number }
  | { type: "readings"; readings: Reading[] }
  | { type: "state"; running: boolean; halted: boolean };

/** Steps already run when the figure opens, so the detector is past its warm-up. */
const PRELUDE = 120;
/** Steps the recorder keeps running after the spike before it halts. */
const AFTER_SPIKE = 14;
const LIMIT = 900;
const TICK_MS = 50;

// Typed by hand: the project compiles against the DOM lib, not the worker lib.
const ctx = self as unknown as { postMessage(m: FromRecorder): void; onmessage: ((e: MessageEvent<ToRecorder>) => void) | null };

let run: TrainingRun;
let detector: CusumDetector;
let seed = 1;
let lr = 1;
let streaming = true;
let running = false;
let spikeAt: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

function read(): Reading {
  const s = run.next();
  const r = detector.push(s.loss);
  if (s.spike && spikeAt === null) spikeAt = s.step;
  return { step: s.step, loss: s.loss, reference: s.reference, s: r.s, alarm: r.alarm, spike: s.spike, grads: s.grads };
}

const halted = () => (spikeAt !== null && run.step > spikeAt + AFTER_SPIKE) || run.step >= LIMIT;

function post(msg: FromRecorder) {
  ctx.postMessage(msg);
}

function setRunning(next: boolean) {
  running = next && !halted();
  clearInterval(timer);
  if (running) {
    timer = setInterval(() => {
      post({ type: "readings", readings: [read()] });
      if (halted()) setRunning(false);
    }, TICK_MS);
  }
  post({ type: "state", running, halted: halted() });
}

/** A fresh run. Streaming: a prelude, then live steps. Still: the whole run at once, surge at the prelude's end. */
function reset() {
  run = new TrainingRun(seed);
  detector = new CusumDetector();
  spikeAt = null;
  const readings: Reading[] = [];
  for (let i = 0; i < PRELUDE; i++) readings.push(read());
  run.setLearningRate(lr);
  if (!streaming) while (!halted()) readings.push(read());
  post({ type: "reset", readings, lr });
  setRunning(streaming);
}

ctx.onmessage = (e: MessageEvent<ToRecorder>) => {
  const m = e.data;
  if (m.type === "start") {
    seed = m.seed;
    streaming = m.streaming;
    lr = 1;
    reset();
  } else if (m.type === "lr") {
    lr = m.value;
    // A live run takes the new rate at the current step; a halted or still run starts over.
    if (streaming && !halted()) run.setLearningRate(lr);
    else {
      seed++;
      reset();
    }
  } else if (m.type === "play") {
    if (halted()) {
      seed++;
      reset();
    } else setRunning(true);
  } else if (m.type === "pause") setRunning(false);
};
