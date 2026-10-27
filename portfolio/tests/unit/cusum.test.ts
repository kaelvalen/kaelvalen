import { test } from "node:test";
import assert from "node:assert/strict";
import { CusumDetector } from "../../src/lib/cusum.ts";
import { TrainingRun } from "../../src/lib/run-sim.ts";

const STEPS = 400;
const ONSET = 80;

/** Runs one simulated run; returns the first alarm step and the first spike step. */
function episode(seed: number, lr: number) {
  const run = new TrainingRun(seed);
  const det = new CusumDetector();
  let alarm: number | null = null;
  let spike: number | null = null;
  for (let i = 0; i < STEPS; i++) {
    if (i === ONSET) run.setLearningRate(lr);
    const s = run.next();
    if (det.push(s.loss).alarm && alarm === null) alarm = s.step;
    if (s.spike && spike === null) spike = s.step;
  }
  return { alarm, spike };
}

test("no false alarm in 300 nominal runs", () => {
  const falseAlarms = Array.from({ length: 300 }, (_, i) => episode(i + 1, 1)).filter((r) => r.alarm !== null);
  assert.equal(falseAlarms.length, 0);
});

for (const lr of [1.3, 1.5, 2, 3, 5]) {
  test(`alarm precedes the spike at ${lr}× in every one of 60 runs`, () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { alarm, spike } = episode(seed, lr);
      assert.ok(spike !== null, `seed ${seed}: run never spiked`);
      assert.ok(alarm !== null && alarm >= ONSET, `seed ${seed}: no alarm after onset`);
      assert.ok(alarm < spike, `seed ${seed}: alarm at ${alarm}, spike at ${spike}`);
    }
  });
}

test("the detector is deterministic", () => {
  assert.deepEqual(episode(7, 3), episode(7, 3));
});
