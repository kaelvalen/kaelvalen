import { test } from "node:test";
import assert from "node:assert/strict";
import { basinAt, basinsFor, contours, isDay, moonPhase, settle, slice, sunAltitude, surface } from "../../src/lib/landscape.ts";

test("contour points lie on their level", () => {
  // a cone: the level-r contour is the circle of radius r around the centre
  const f = (x: number, y: number) => Math.hypot(x - 0.5, y - 0.5);
  const cs = contours(f, 80, 80, 10);
  const ring = cs.find((c) => c.index === 3)!;
  assert.ok(ring.segments.length > 40, "the ring has segments");
  for (let i = 0; i < ring.segments.length; i += 2) {
    const r = Math.hypot(ring.segments[i] - 0.5, ring.segments[i + 1] - 0.5);
    assert.ok(Math.abs(r - 0.3) < 0.005, `point at radius ${r.toFixed(4)}`);
  }
});

test("a flat surface has no contours", () => {
  assert.equal(contours(() => 0.123, 20, 20, 26).length, 0);
});

for (const tall of [false, true]) {
  const basins = basinsFor(tall);
  const f = surface(basins);
  const shape = tall ? "tall" : "wide";

  test(`a ball dropped near a basin settles in it (${shape} map)`, () => {
    for (const b of basins.filter((b) => !b.ridge)) {
      const end = settle(f, b.x + 0.02, b.y - 0.015);
      assert.equal(basinAt(basins, end.x, end.y)?.id, b.id, `dropped by ${b.id}`);
      assert.ok(end.steps < 2500, "it comes to rest");
    }
  });

  test(`nothing settles on the NOESIS ridge (${shape} map)`, () => {
    const ridge = basins.find((b) => b.ridge)!;
    const end = settle(f, ridge.x + 0.001, ridge.y);
    assert.ok(Math.hypot(end.x - ridge.x, end.y - ridge.y) > 0.03, "the ball rolls off the ridge");
  });

  test(`a slice dips through a basin and rises over the ridge (${shape} map)`, () => {
    for (const b of basins) {
      const s = slice(f, b);
      if (b.ridge) assert.ok(s[30] > Math.min(s[0], s[60]), `${b.id} rises`);
      else assert.ok(s[30] < Math.max(s[0], s[60]), `${b.id} dips`);
    }
  });
}

test("the sun over Ankara: high at a June noon, down on a December night", () => {
  assert.ok(sunAltitude(new Date(Date.UTC(2026, 5, 21, 9, 50))) > 70);
  assert.ok(sunAltitude(new Date(Date.UTC(2026, 11, 21, 20, 0))) < -30);
  // Türkiye keeps UTC+3 all year, so Ankara's sunset on 13 Nov 2026 is near 17:30 local (14:30 UTC)
  assert.equal(isDay(new Date(Date.UTC(2026, 10, 13, 14, 0))), true);
  assert.equal(isDay(new Date(Date.UTC(2026, 10, 13, 15, 0))), false);
});

test("the moon: full on 3 Jan 2026, new on 18 Jan 2026", () => {
  assert.ok(moonPhase(new Date(Date.UTC(2026, 0, 3, 10))).lit > 0.97);
  assert.ok(moonPhase(new Date(Date.UTC(2026, 0, 18, 20))).lit < 0.03);
  assert.equal(moonPhase(new Date(Date.UTC(2026, 0, 25))).waxing, true);
});
