/*
 * The landscape: a loss surface whose basins are the work. Pure functions only, so the page and the
 * unit tests run the same code: the surface, its contour lines (marching squares), gradient descent
 * on it, and the sky over Ankara (is the sun up, how much of the moon is lit).
 */

export type BasinId = "relic" | "trainscope" | "latch-lang" | "measure" | "connor" | "noesis";

/** A Gaussian dent in the surface. A ridge has negative depth: a bump with no minimum under it. */
export type Basin = { id: BasinId; x: number; y: number; depth: number; width: number; ridge?: boolean };

// Positions are fractions of the map; depths and widths are a composition, not a measurement.
const WIDE: Basin[] = [
  { id: "relic", x: 0.62, y: 0.36, depth: 1.1, width: 0.01 },
  { id: "trainscope", x: 0.84, y: 0.62, depth: 0.8, width: 0.008 },
  { id: "latch-lang", x: 0.43, y: 0.22, depth: 0.55, width: 0.005 },
  { id: "measure", x: 0.88, y: 0.3, depth: 0.45, width: 0.004 },
  { id: "connor", x: 0.6, y: 0.7, depth: 0.4, width: 0.004 },
  { id: "noesis", x: 0.75, y: 0.47, depth: -0.55, width: 0.004, ridge: true },
];

// On a tall screen the text sits at the bottom, so the basins gather above it.
// The text takes the lower half there, so every basin and its label stays above y = 0.45.
const TALL: Record<BasinId, [number, number]> = {
  relic: [0.48, 0.25],
  trainscope: [0.8, 0.33],
  "latch-lang": [0.16, 0.19],
  measure: [0.78, 0.15],
  connor: [0.22, 0.35],
  noesis: [0.58, 0.41],
};

export function basinsFor(tall: boolean): Basin[] {
  return tall ? WIDE.map((b) => ({ ...b, x: TALL[b.id][0], y: TALL[b.id][1], width: b.width * 0.7 })) : WIDE;
}

export type Surface = (x: number, y: number) => number;

/** A wide bowl centred right of the text, minus one Gaussian per basin. */
export function surface(basins: Basin[]): Surface {
  return (x, y) => {
    let v = 0.9 * ((x - 0.62) ** 2 + 0.7 * (y - 0.5) ** 2);
    for (const b of basins) v -= b.depth * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / b.width);
    return v;
  };
}

/** One contour level: its value, its index (level × k) and its segments as flat [x1, y1, x2, y2, …] in map fractions. */
export type Contour = { level: number; index: number; segments: number[] };

type Edge = "top" | "right" | "bottom" | "left";
// Which cell edges each corner pattern joins (corners above the level: tl 8, tr 4, br 2, bl 1).
// The two saddles (5, 10) are resolved by the cell's mean.
const CASES: Record<number, Edge[][]> = {
  1: [["left", "bottom"]], 2: [["bottom", "right"]], 3: [["left", "right"]], 4: [["top", "right"]],
  6: [["top", "bottom"]], 7: [["left", "top"]], 8: [["left", "top"]], 9: [["top", "bottom"]],
  11: [["top", "right"]], 12: [["left", "right"]], 13: [["bottom", "right"]], 14: [["left", "bottom"]],
};

/**
 * Marching squares over a cols × rows grid of samples. Levels are every 1/k of the surface's value;
 * each cell only visits the levels between its corners, so the cost follows the lines, not the levels.
 */
export function contours(f: Surface, cols: number, rows: number, k: number): Contour[] {
  const w = cols + 1;
  const v = new Float64Array(w * (rows + 1));
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) v[j * w + i] = f(i / cols, j / rows);
  const byIndex = new Map<number, number[]>();

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = v[j * w + i], tr = v[j * w + i + 1], br = v[(j + 1) * w + i + 1], bl = v[(j + 1) * w + i];
      const lo = Math.ceil(Math.min(tl, tr, br, bl) * k), hi = Math.floor(Math.max(tl, tr, br, bl) * k);
      for (let n = lo; n <= hi; n++) {
        const c = n / k;
        const code = (tl > c ? 8 : 0) | (tr > c ? 4 : 0) | (br > c ? 2 : 0) | (bl > c ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const t = (a: number, b: number) => (c - a) / (b - a);
        const point = (e: Edge) =>
          e === "top" ? [(i + t(tl, tr)) / cols, j / rows]
          : e === "right" ? [(i + 1) / cols, (j + t(tr, br)) / rows]
          : e === "bottom" ? [(i + t(bl, br)) / cols, (j + 1) / rows]
          : [i / cols, (j + t(tl, bl)) / rows];
        const centreHigh = (tl + tr + br + bl) / 4 > c;
        const pairs: Edge[][] =
          code === 5 ? (centreHigh ? [["left", "top"], ["bottom", "right"]] : [["left", "bottom"], ["top", "right"]])
          : code === 10 ? (centreHigh ? [["top", "right"], ["left", "bottom"]] : [["left", "top"], ["bottom", "right"]])
          : CASES[code];
        let seg = byIndex.get(n);
        if (!seg) byIndex.set(n, (seg = []));
        for (const [a, b] of pairs) seg.push(...point(a), ...point(b));
      }
    }
  }
  return [...byIndex.entries()].sort((a, b) => a[0] - b[0]).map(([index, segments]) => ({ level: index / k, index, segments }));
}

export type Descent = { x: number; y: number; steps: number; path: number[] };

const STILL = 2e-5;
const MAX_STEPS = 2500;

/** Gradient descent with momentum (heavy ball). Yields after every step; done when still or after 2500 steps. */
export function* descend(f: Surface, x: number, y: number, { lr = 0.0016, momentum = 0.9 } = {}): Generator<Descent, Descent> {
  let vx = 0, vy = 0, steps = 0;
  const path = [x, y];
  const e = 1e-4;
  for (;;) {
    const gx = (f(x + e, y) - f(x - e, y)) / (2 * e), gy = (f(x, y + e) - f(x, y - e)) / (2 * e);
    vx = momentum * vx - lr * gx;
    vy = momentum * vy - lr * gy;
    x += vx;
    y += vy;
    steps++;
    path.push(x, y);
    if ((steps > 20 && Math.hypot(vx, vy) < STILL) || steps >= MAX_STEPS) return { x, y, steps, path };
    yield { x, y, steps, path };
  }
}

/** Runs a descent to the end. */
export function settle(f: Surface, x: number, y: number): Descent {
  const it = descend(f, x, y);
  for (;;) {
    const r = it.next();
    if (r.done) return r.value;
  }
}

/** The basin a point has settled in, if it is near one; a ridge never holds anything. */
export function basinAt(basins: Basin[], x: number, y: number): Basin | null {
  let best: Basin | null = null, d = 0.06;
  for (const b of basins) {
    const dist = Math.hypot(b.x - x, b.y - y);
    if (!b.ridge && dist < d) {
      best = b;
      d = dist;
    }
  }
  return best;
}

/** A horizontal slice through a basin: n + 1 samples across ±span of the map. */
export function slice(f: Surface, b: Basin, n = 60, span = 0.12): number[] {
  return Array.from({ length: n + 1 }, (_, i) => f(b.x - span + (2 * span * i) / n, b.y));
}

/* ------------------------------------------------------------------ */
/* The sky over Ankara                                                 */
/* ------------------------------------------------------------------ */

export const ANKARA = { lat: 39.93, lon: 32.86 };

/** The sun's altitude in degrees (NOAA's simplified solar position; good to well under a degree). */
export function sunAltitude(date: Date, lat = ANKARA.lat, lon = ANKARA.lon): number {
  const rad = Math.PI / 180;
  const day = (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5;
  const g = ((2 * Math.PI) / 365) * (day - 1 + (date.getUTCHours() - 12) / 24);
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const hourAngle = ((date.getUTCHours() * 60 + date.getUTCMinutes() + eqt + 4 * lon) / 4 - 180) * rad;
  const cosZ = Math.sin(lat * rad) * Math.sin(decl) + Math.cos(lat * rad) * Math.cos(decl) * Math.cos(hourAngle);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZ))) / rad;
}

/** Day once the sun's upper limb clears the horizon, with refraction (−0.833°). */
export const isDay = (date = new Date()) => sunAltitude(date) > -0.833;

/** The moon from the mean synodic month: phase in [0, 1) from new, the lit fraction, and whether it is waxing. */
export function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const newMoon = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((((date.getTime() - newMoon) / 864e5) % synodic) + synodic) % synodic;
  const phase = age / synodic;
  return { phase, lit: (1 - Math.cos(2 * Math.PI * phase)) / 2, waxing: phase < 0.5 };
}
