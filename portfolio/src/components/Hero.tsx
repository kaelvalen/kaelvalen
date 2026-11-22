"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { THEME_CHANGE } from "@/lib/theme";
import { basinAt, basinsFor, contours, descend, moonPhase, surface, type Basin, type BasinId, type Contour, type Descent } from "@/lib/landscape";
import SheetLink from "./SheetLink";

export const BASIN_NAMES: Record<BasinId, string> = {
  relic: "RELIC",
  weightsmith: "Weightsmith",
  "latch-lang": "latch-lang",
  measure: "measure",
  connor: "connor",
  noesis: "NOESIS",
};

const CELL = 6; // CSS px per marching-squares cell: smooth enough, cheap enough to redo on resize
const K = 26; // contour levels per unit of the surface
const TAIL = 70; // at night only the last steps of the path show, as a shooting star's tail

type Colours = { line: number[]; deep: number[]; accent: string; night: boolean };

const DAY_PRINT_COLOURS: Colours = { line: [60, 95, 99], deep: [19, 48, 47], accent: "#b8215a", night: false };

function colours(): Colours {
  const s = getComputedStyle(document.documentElement);
  const rgb = (name: string) => s.getPropertyValue(name).trim().split(/\s+/).map(Number);
  return { line: rgb("--map-line"), deep: rgb("--map-deep"), accent: s.getPropertyValue("--accent").trim(), night: document.documentElement.dataset.theme === "dark" };
}

function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws the moon as it is tonight: the lit half, then the terminator ellipse adds or carves light. */
function drawMoon(cv: HTMLCanvasElement, phase: number, waxing: boolean, night: boolean) {
  const c = cv.getContext("2d");
  if (!c) return;
  const s = getComputedStyle(document.documentElement);
  const light = night ? "#efe6c8" : s.getPropertyValue("--ink").trim();
  const dark = s.getPropertyValue("--sky-glow").trim();
  const R = cv.width * 0.43, C = cv.width / 2;
  c.clearRect(0, 0, cv.width, cv.height);
  c.fillStyle = light;
  c.globalAlpha = 0.14;
  c.beginPath();
  c.arc(C, C, R, 0, 7);
  c.fill();
  c.globalAlpha = 1;
  c.beginPath();
  c.arc(C, C, R, -Math.PI / 2, Math.PI / 2, !waxing);
  c.fill();
  const k = Math.cos(2 * Math.PI * phase);
  c.fillStyle = k > 0 ? dark : light;
  c.beginPath();
  c.ellipse(C, C, Math.abs(k) * R, R, 0, 0, 7);
  c.fill();
  if (k > 0) {
    c.globalAlpha = 0.14;
    c.fillStyle = light;
    c.fill();
    c.globalAlpha = 1;
  }
}

export default function Hero() {
  const { t } = useI18n();
  const h = t.hero;
  const box = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const moonCanvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef(h);
  const dropAt = useRef<(x: number, y: number) => void>(() => {});
  const redrawSettled = useRef<() => void>(() => {});
  const [tall, setTall] = useState(false);
  const [settledText, setSettledText] = useState("");
  const [moon, setMoon] = useState<{ lit: number; waxing: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    copy.current = h;
    redrawSettled.current();
  }, [h]);

  useEffect(() => {
    const el = box.current, cv = canvas.current, mc = moonCanvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx || !mc) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let basins: Basin[] = [], f = surface([]), lines: Contour[] = [];
    let W = 0, H = 0, dpr = 1, raf = 0, last: Descent | null = null, settled = false;
    const base = document.createElement("canvas");

    // The map: contour lines, deeper ones leaning toward the accent, and at night a seeded field of stars.
    function paint(override?: Colours) {
      const c = override ?? colours();
      base.width = cv!.width;
      base.height = cv!.height;
      const b = base.getContext("2d")!;
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const ln of lines) {
        const index = ln.index % 5 === 0;
        const depth = Math.min(1, Math.max(0, -ln.level * 1.1 + 0.15)) * (c.night ? 0.55 : 0.9);
        const rgb = c.line.map((v, i) => Math.round(v + (c.deep[i] - v) * depth));
        b.strokeStyle = `rgb(${rgb.join(" ")} / ${(index ? 0.78 : 0.42) * (c.night ? 0.85 : 1)})`;
        b.lineWidth = index ? 1.1 : 0.55;
        b.beginPath();
        const s = ln.segments;
        for (let i = 0; i < s.length; i += 4) {
          b.moveTo(s[i] * W, s[i + 1] * H);
          b.lineTo(s[i + 2] * W, s[i + 3] * H);
        }
        b.stroke();
      }
      labelContours(b, c);
      if (c.night) {
        const rnd = seeded(20261113);
        b.fillStyle = "#ece8f6";
        for (let i = 0; i < 140; i++) {
          const x = rnd() * W, y = rnd() * H, r = rnd() ** 3 * 1.2 + 0.3;
          b.globalAlpha = 0.15 + 0.4 * rnd();
          b.beginPath();
          b.arc(x, y, r, 0, 7);
          b.fill();
        }
        b.globalAlpha = 1;
      }
      render(settled, c);
    }

    // Each heavy contour gets its value written along it once, where it runs flat enough to read,
    // clear of the basin labels and of the other values. The line is erased under the figures.
    function labelContours(b: CanvasRenderingContext2D, c: Colours) {
      const placed: [number, number][] = [];
      const tall = W < H;
      const frac = (v: number) => v - Math.floor(v);
      b.font = `500 10px ${getComputedStyle(document.body).fontFamily}`;
      b.textAlign = "center";
      b.textBaseline = "middle";
      for (const ln of lines) {
        if (ln.index % 5 !== 0 || ln.index === 0) continue;
        const s = ln.segments;
        // a different spot along each line, so the values do not stack in one column
        const tx = tall ? 0.2 + 0.6 * frac(ln.index * 0.618) : 0.5 + 0.42 * frac(ln.index * 0.618 + 0.3);
        const ty = tall ? 0.08 + 0.36 * frac(ln.index * 0.382) : 0.12 + 0.76 * frac(ln.index * 0.382 + 0.1);
        let best = -1, bd = Infinity;
        for (let i = 0; i < s.length; i += 4) {
          const mx = (s[i] + s[i + 2]) / 2, my = (s[i + 1] + s[i + 3]) / 2;
          if (tall ? mx < 0.06 || mx > 0.94 || my < 0.06 || my > 0.46 : mx < 0.42 || mx > 0.97 || my < 0.08 || my > 0.92) continue;
          if ((mx > 0.8 && my < (tall ? 0.12 : 0.22)) || (!tall && mx > 0.72 && my > 0.58)) continue; // the moon and the legend
          const dx = (s[i + 2] - s[i]) * W, dy = (s[i + 3] - s[i + 1]) * H;
          if (Math.abs(dy) > Math.abs(dx) * 0.6) continue;
          if (basins.some((q) => Math.hypot((q.x - mx) * W, (q.y - my) * H) < 95)) continue;
          if (placed.some(([x, y]) => Math.hypot((x - mx) * W, (y - my) * H) < 130)) continue;
          const d = Math.hypot(mx - tx, my - ty);
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best < 0) continue;
        const mx = (s[best] + s[best + 2]) / 2, my = (s[best + 1] + s[best + 3]) / 2;
        let a = Math.atan2((s[best + 3] - s[best + 1]) * H, (s[best + 2] - s[best]) * W);
        if (a > Math.PI / 2) a -= Math.PI;
        if (a < -Math.PI / 2) a += Math.PI;
        const text = ln.level.toFixed(2).replace("-", "−");
        const w = b.measureText(text).width;
        b.save();
        b.translate(mx * W, my * H);
        b.rotate(a);
        b.globalCompositeOperation = "destination-out";
        b.fillRect(-w / 2 - 3, -6, w + 6, 12);
        b.globalCompositeOperation = "source-over";
        b.fillStyle = `rgb(${c.line.join(" ")} / 0.95)`;
        b.fillText(text, 0, 0.5);
        b.restore();
        placed.push([mx, my]);
      }
    }

    // The map, then the ball and its path if one has been dropped.
    function render(done = false, override?: Colours) {
      const g = ctx!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv!.width, cv!.height);
      g.drawImage(base, 0, 0);
      if (!last) return;
      const c = override ?? colours(), p = last.path, n = p.length / 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.lineCap = "round";
      g.strokeStyle = c.accent;
      const from = c.night ? Math.max(0, n - TAIL) : 0;
      for (let i = from + 1; i < n; i++) {
        const k = (i - from) / (n - from);
        g.globalAlpha = c.night ? k : 1;
        g.lineWidth = c.night ? 2.4 * k + 0.4 : 1.6;
        g.beginPath();
        g.moveTo(p[2 * i - 2] * W, p[2 * i - 1] * H);
        g.lineTo(p[2 * i] * W, p[2 * i + 1] * H);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = c.accent;
      if (c.night) {
        g.shadowColor = c.accent;
        g.shadowBlur = 14;
      }
      g.beginPath();
      g.arc(last.x * W, last.y * H, 5.5, 0, 7);
      g.fill();
      g.shadowBlur = 0;
      if (done) {
        const hit = basinAt(basins, last.x, last.y);
        const text = hit ? copy.current.settled(BASIN_NAMES[hit.id], last.steps) : copy.current.unnamed(last.steps);
        g.font = `500 14px ${getComputedStyle(document.body).fontFamily}`;
        const tw = g.measureText(text).width;
        const px = last.x * W;
        const py = Math.max(24, last.y * H - 12);
        let tx = px + 12;
        if (px + 12 + tw > W - 12 && px - 12 - tw >= 12) {
          g.textAlign = "right";
          tx = px - 12;
        } else {
          g.textAlign = "left";
          tx = Math.max(12, Math.min(W - 12 - tw, px + 12));
        }
        g.fillText(text, tx, py);
        setSettledText(text);
      }
    }

    function layout() {
      const r = el!.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      const isTall = W < H;
      setTall(isTall);
      basins = basinsFor(isTall);
      f = surface(basins);
      lines = contours(f, Math.ceil(W / CELL), Math.ceil(H / CELL), K);
      cv!.width = Math.round(W * dpr);
      cv!.height = Math.round(H * dpr);
      last = null;
      settled = false;
      setSettledText("");
      paint();
    }

    dropAt.current = (x, y) => {
      cancelAnimationFrame(raf);
      settled = false;
      setSettledText("");
      const it = descend(f, x, y);
      const tick = () => {
        for (let i = 0; i < (still ? Infinity : 3); i++) {
          const r = it.next();
          last = r.value;
          if (r.done) {
            settled = true;
            render(true);
            return;
          }
        }
        render();
        raf = requestAnimationFrame(tick);
      };
      tick();
    };

    redrawSettled.current = () => {
      if (settled && lines.length) render(true);
    };

    const sky = () => {
      const m = moonPhase();
      setMoon({ lit: Math.round(m.lit * 100), waxing: m.waxing });
      drawMoon(mc, m.phase, m.waxing, document.documentElement.dataset.theme === "dark");
      if (lines.length) paint();
    };

    const onBeforePrint = () => {
      if (lines.length) paint(DAY_PRINT_COLOURS);
    };
    const onAfterPrint = () => {
      if (lines.length) paint();
    };

    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    });
    ro.observe(el);
    sky();
    window.addEventListener(THEME_CHANGE, sky);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener(THEME_CHANGE, sky);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onMap = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as Element).closest("a, button, aside, [data-hero-copy]")) return;
    const r = e.currentTarget.getBoundingClientRect();
    dropAt.current((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(h.install);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the command stays visible to copy by hand */
    }
  };

  const basins = basinsFor(tall);
  const height = surface(basins);
  const spot = (b: Basin) => {
    const v = height(b.x, b.y);
    return (v > 0 ? "+" : "−") + Math.abs(v).toFixed(2);
  };

  return (
    <header
      ref={box}
      id="top"
      data-sheet-id="top"
      onClick={onMap}
      className="relative h-[calc(100svh-3.5rem)] max-h-[1100px] min-h-[720px] cursor-crosshair overflow-hidden sm:min-h-[600px]"
      style={{ background: "radial-gradient(110% 80% at 85% 0%, var(--sky-glow), var(--paper) 70%)" }}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />

      {/* Places on the map: a spot mark at the exact point, the name set beside it as a surveyor would. */}
      <ul aria-label={h.mapLabel} className="pointer-events-none absolute inset-0">
        {basins.map((b) => (
          <li key={b.id} className="absolute" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}>
            {b.ridge ? (
              <svg aria-hidden viewBox="0 0 10 9" className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 fill-accent">
                <path d="M5 0 10 9H0z" />
              </svg>
            ) : (
              <span aria-hidden className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-[3px] ring-paper/70" />
            )}
            <span className={`absolute top-[-9px] whitespace-nowrap ${b.x > (tall ? 0.6 : 0.7) ? "right-2.5 text-right" : "left-2.5"}`}>
              <span className="font-mono text-[10.5px] text-muted">{spot(b)}</span>
              <span className={`block font-display text-[19px] leading-[1.05] italic ${b.ridge ? "text-accent" : "text-ink"}`}>{BASIN_NAMES[b.id]}</span>
              <span className="block text-[12px] text-muted">{h.basins[b.id]}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute top-6 right-5 text-right text-[12px] text-muted sm:right-12">
        <canvas ref={moonCanvas} width={168} height={168} aria-hidden className="mb-2 ml-auto block size-10 sm:size-[72px]" />
        <span className="hidden sm:inline">{moon && h.moon(moon.lit, moon.waxing)}</span>
      </div>

      <div data-hero-copy className="absolute right-5 bottom-8 left-5 max-w-[600px] cursor-auto sm:right-auto sm:bottom-14 sm:left-12">
        <h1 className="font-display text-[clamp(60px,8.4vw,128px)] leading-[0.82] font-normal tracking-[-0.03em] text-ink">{h.alias}</h1>
        <p className="mt-5 text-[15px] text-muted">{h.place}</p>
        <p className="mt-3 max-w-[38ch] text-[clamp(17px,1.35vw,19px)] leading-[1.55] text-pretty text-ink-soft">{h.lead}</p>
        <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[15px]" data-no-print>
          <SheetLink sheet="research" className="text-ink underline decoration-line-strong underline-offset-[5px] hover:decoration-accent">
            {h.ctaPrimary}
          </SheetLink>
          <button
            type="button"
            onClick={copyInstall}
            aria-label={h.installLabel}
            title={h.installLabel}
            className="cursor-pointer font-mono text-[13px] text-muted transition-colors hover:text-ink"
          >
            {h.install}
            <span aria-live="polite" className="ml-2 font-sans text-[12px] text-accent">
              {copied ? h.installCopied : ""}
            </span>
          </button>
        </p>
      </div>

      {/* A map legend, which is also where the map says what is real on it and what is not. */}
      <aside className="absolute right-6 bottom-8 hidden w-[232px] cursor-auto border border-line bg-paper/80 px-4 py-3.5 text-[12.5px] leading-snug text-muted backdrop-blur-sm lg:block xl:right-12 xl:bottom-14 xl:w-[250px]" data-no-print>
        <p className="mb-2 font-display text-[15px] text-ink italic">{h.legend.title}</p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-3">
            <span aria-hidden className="ml-[3px] size-[7px] rounded-full bg-ink" />
            {h.legend.minimum}
          </li>
          <li className="flex items-center gap-3">
            <svg aria-hidden viewBox="0 0 10 9" className="size-2.5 fill-accent">
              <path d="M5 0 10 9H0z" />
            </svg>
            {h.legend.ridge}
          </li>
          <li className="flex items-center gap-3">
            <svg aria-hidden viewBox="0 0 12 10" className="h-2.5 w-3 shrink-0 stroke-muted" fill="none">
              <path d="M0 2.5h12" strokeWidth=".6" />
              <path d="M0 7.5h12" strokeWidth="1.3" />
            </svg>
            {h.legend.contours}
          </li>
        </ul>
        <p className="mt-3 border-t border-line pt-2.5 text-ink-soft">{h.legend.honest}</p>
        <button
          type="button"
          onClick={() => dropAt.current(0.35 + Math.random() * 0.6, 0.1 + Math.random() * 0.8)}
          className="mt-1.5 cursor-pointer text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent"
        >
          {h.drop}
        </button>
      </aside>
      <p aria-live="polite" className="sr-only">
        {settledText}
      </p>
    </header>
  );
}
