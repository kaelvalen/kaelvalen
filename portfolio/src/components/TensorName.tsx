"use client";

import { useEffect, useRef } from "react";

/** Two heads read the same query through different projections and temperatures. */
export const HEADS = [
  { tau: 0.6, angle: 0, gain: 1 }, // head 1: sharp, drawn in the markup colour
  { tau: 1.5, angle: (140 * Math.PI) / 180, gain: 0.8 }, // head 2: broader, drawn in ink
] as const;
// Above this share of its peak weight a key takes head 1's colour; head 2 needs more to darken.
const HOT = 0.12;

export type Readouts = {
  query: React.RefObject<HTMLElement | null>;
  peak1: React.RefObject<HTMLElement | null>;
  peak2: React.RefObject<HTMLElement | null>;
};

const VERT = `#version 300 es
in vec2 aKey;
uniform vec2 uRes;
uniform vec2 uQ[2];
uniform float uInvTau[2];
uniform float uMax[2];
uniform float uInvScale2;
uniform float uDpr;
out vec2 vRel;
void main() {
  vec2 d1 = aKey - uQ[0];
  vec2 d2 = aKey - uQ[1];
  // Each key's weight as a share of its head's peak: exp(s − s_max), s = −|q − k|² / τ.
  float r1 = exp(-dot(d1, d1) * uInvScale2 * uInvTau[0] - uMax[0]);
  float r2 = exp(-dot(d2, d2) * uInvScale2 * uInvTau[1] - uMax[1]);
  vRel = vec2(r1, r2);
  gl_PointSize = 2.0 * uDpr * (0.55 + 1.9 * max(r1, 0.6 * r2)) + 0.5;
  vec2 clip = aKey / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec2 vRel;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uHot;
out vec4 outColor;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = dot(p, p);
  float edge = 1.0 - smoothstep(0.7, 1.0, r);
  if (edge <= 0.0) discard;
  vec3 c; float a;
  if (vRel.x > uHot) { c = uAccent; a = 0.65 + 0.35 * vRel.x; }
  else if (vRel.y > 0.35) { c = uInk; a = 0.35 + 0.45 * vRel.y; }
  else { c = uInk; a = min(1.0, 0.42 + 1.5 * max(vRel.x, 0.6 * vRel.y)); }
  a *= edge;
  outColor = vec4(c * a, a);
}`;

function rgb(v: string) {
  const h = v.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function compile(gl: WebGL2RenderingContext) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "");
  return p;
}

/**
 * The name, sampled into a dense grid of dots ("keys"). The pointer is a query read by two attention
 * heads; every frame each dot's size is its softmax weight under the head that wants it most,
 * exp(−|q − k|² / τ) over all keys. Head 1 reads the query as it is with a sharp temperature; head 2
 * reads it through a rotation about the centre with a broad one. Weights and point sizes are
 * computed per dot on the GPU (WebGL2); the CPU only finds each head's maximum and normaliser for
 * the readouts. Without a pointer the query drifts on a slow Lissajous path; with reduced motion it
 * stays put. Falls back to Canvas 2D without WebGL2.
 */
export default function TensorName({ text, onKeys, readouts }: { text: string; onKeys: (n: number) => void; readouts: Readouts }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mark1 = useRef<HTMLSpanElement>(null);
  const mark2 = useRef<HTMLSpanElement>(null);
  const onKeysRef = useRef(onKeys);

  useEffect(() => {
    onKeysRef.current = onKeys;
  }, [onKeys]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = c.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    const ctx = gl ? null : c.getContext("2d");

    let keys = new Float32Array(0);
    let count = 0;
    let ink = [0, 0, 0];
    let accent = [1, 0, 0];
    let pointer: { x: number; y: number } | null = null;
    const q = { x: 0, y: 0 };
    let frame = 0;
    let visible = true;
    let tick = 0;
    const t0 = performance.now();

    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      try {
        const p = compile(gl);
        prog = p;
        gl.useProgram(p);
        buf = gl.createBuffer();
        const loc = gl.getAttribLocation(p, "aKey");
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        u = Object.fromEntries(
          ["uRes", "uQ", "uInvTau", "uMax", "uInvScale2", "uDpr", "uInk", "uAccent", "uHot"].map((n) => [n, gl.getUniformLocation(p, n)])
        );
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } catch {
        prog = null;
      }
    }

    const readColours = () => {
      const s = getComputedStyle(document.documentElement);
      ink = rgb(s.getPropertyValue("--ink"));
      accent = rgb(s.getPropertyValue("--accent"));
    };

    const build = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const W = c.width;
      const H = c.height;
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      const family = getComputedStyle(document.body).fontFamily;
      let size = H * 0.82;
      o.font = `900 ${size}px ${family}`;
      let w = o.measureText(text).width;
      if (w > W * 0.94) {
        size *= (W * 0.94) / w;
        o.font = `900 ${size}px ${family}`;
        w = o.measureText(text).width;
      }
      o.textBaseline = "middle";
      o.fillText(text, (W - w) / 2, H * 0.52);
      const data = o.getImageData(0, 0, W, H).data;
      // Denser than a 2D canvas could afford: every 3 CSS px on wide screens.
      const step = Math.max(2, Math.round((W < 700 * dpr ? 4 : gl ? 3 : 5) * dpr));
      const pts: number[] = [];
      for (let y = step / 2; y < H; y += step)
        for (let x = step / 2; x < W; x += step) if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) pts.push(x, y);
      keys = new Float32Array(pts);
      count = pts.length / 2;
      if (gl && prog) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, keys, gl.STATIC_DRAW);
      }
      q.x = W * 0.3;
      q.y = H * 0.5;
      onKeysRef.current(count);
    };

    // Head h's query: head 1 reads the pointer; head 2 a rotated, shrunk copy about the centre.
    const queryOf = (h: number, W: number, H: number) => {
      const { angle, gain } = HEADS[h];
      const cx = W / 2;
      const cy = H / 2;
      const dx = (q.x - cx) * gain;
      const dy = (q.y - cy) * gain;
      return { x: cx + dx * Math.cos(angle) - dy * Math.sin(angle) * (W / H), y: cy + dx * Math.sin(angle) * (H / W) + dy * Math.cos(angle) };
    };

    const draw = (now: number) => {
      const W = c.width;
      const H = c.height;
      const tt = (now - t0) / 1000;
      const target = pointer ?? (still ? { x: W * 0.3, y: H * 0.5 } : { x: W * (0.5 + 0.42 * Math.sin(tt * 0.35)), y: H * (0.5 + 0.28 * Math.sin(tt * 0.7)) });
      q.x += (target.x - q.x) * (still ? 1 : 0.12);
      q.y += (target.y - q.y) * (still ? 1 : 0.12);

      const scale = W * 0.08;
      const inv2 = 1 / (scale * scale);
      const qs = [queryOf(0, W, H), queryOf(1, W, H)];
      // Per head: the largest score (for a stable exp) and the normaliser Z (peak weight = 1/Z).
      const maxS = [0, 0];
      const peak = [0, 0];
      for (let h = 0; h < 2; h++) {
        const it = 1 / HEADS[h].tau;
        let best = Infinity;
        for (let i = 0; i < count; i++) {
          const dx = keys[2 * i] - qs[h].x;
          const dy = keys[2 * i + 1] - qs[h].y;
          const d = dx * dx + dy * dy;
          if (d < best) best = d;
        }
        maxS[h] = -best * inv2 * it;
        if ((tick & 3) === 0) {
          let z = 0;
          for (let i = 0; i < count; i++) {
            const dx = keys[2 * i] - qs[h].x;
            const dy = keys[2 * i + 1] - qs[h].y;
            z += Math.exp(-(dx * dx + dy * dy) * inv2 * it - maxS[h]);
          }
          peak[h] = z > 0 ? 1 / z : 0;
        }
      }

      if (gl && prog) {
        gl.viewport(0, 0, W, H);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.uRes, W, H);
        gl.uniform2fv(u.uQ, [qs[0].x, qs[0].y, qs[1].x, qs[1].y]);
        gl.uniform1fv(u.uInvTau, [1 / HEADS[0].tau, 1 / HEADS[1].tau]);
        // The shader computes exp(−d²·k − uMax), so uMax is −s_max.
        gl.uniform1fv(u.uMax, [-maxS[0], -maxS[1]]);
        gl.uniform1f(u.uInvScale2, inv2);
        gl.uniform1f(u.uDpr, dpr);
        gl.uniform3fv(u.uInk, ink);
        gl.uniform3fv(u.uAccent, accent);
        gl.uniform1f(u.uHot, HOT);
        gl.drawArrays(gl.POINTS, 0, count);
      } else if (ctx) {
        ctx.clearRect(0, 0, W, H);
        const css = (v: number[], a: number) => `rgba(${v.map((x) => Math.round(x * 255)).join(",")},${a})`;
        for (let i = 0; i < count; i++) {
          const rel = qs.map((qq, h) => {
            const dx = keys[2 * i] - qq.x;
            const dy = keys[2 * i + 1] - qq.y;
            return Math.exp((-(dx * dx + dy * dy) * inv2) / HEADS[h].tau - maxS[h]);
          });
          ctx.fillStyle = rel[0] > HOT ? css(accent, 0.65 + 0.35 * rel[0]) : css(ink, Math.min(1, 0.42 + 1.5 * Math.max(rel[0], 0.6 * rel[1])));
          ctx.beginPath();
          ctx.arc(keys[2 * i], keys[2 * i + 1], (0.55 + 1.9 * Math.max(rel[0], 0.6 * rel[1])) * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Query markers are DOM: a centre mark for head 1, a ring for head 2.
      const place = (el: HTMLElement | null, p: { x: number; y: number }) => {
        if (el) el.style.transform = `translate(${p.x / dpr}px, ${p.y / dpr}px)`;
      };
      place(mark1.current, qs[0]);
      place(mark2.current, qs[1]);

      if ((tick & 3) === 0) {
        if (readouts.query.current) readouts.query.current.textContent = `${(q.x / W).toFixed(2)}, ${(q.y / H).toFixed(2)}`;
        if (readouts.peak1.current) readouts.peak1.current.textContent = peak[0].toFixed(4);
        if (readouts.peak2.current) readouts.peak2.current.textContent = peak[1].toFixed(4);
      }
      tick++;
    };

    const loop = (now: number) => {
      frame = 0;
      draw(now);
      if (!still && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
      kick();
    };
    const onLeave = () => {
      pointer = null;
      kick();
    };

    readColours();
    let built = false;
    const start = () => {
      build();
      built = true;
      kick();
    };
    // Built once the fonts are in and the main thread is free, so the first paint never waits on it.
    let idleId = 0;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    document.fonts.ready.then(() => {
      idleId = idle(start, { timeout: 1500 });
    });

    const ro = new ResizeObserver(() => {
      if (!built) return;
      build();
      kick();
    });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(c);
    const mo = new MutationObserver(() => {
      readColours();
      kick();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", kick);
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      (window.cancelIdleCallback ?? window.clearTimeout)(idleId);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", kick);
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerleave", onLeave);
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
      }
    };
  }, [text, readouts]);

  return (
    <div className="relative">
      {/* On paper the name is set in type: a live GPU canvas does not print reliably. */}
      <p aria-hidden className="print-only letter-xwide py-6 text-center text-[64pt] leading-none font-black text-ink">
        {text}
      </p>
      <canvas ref={canvas} aria-hidden data-no-print className="block h-[clamp(140px,21vw,320px)] w-full touch-pan-y" />
      <span ref={mark1} aria-hidden data-no-print className="pointer-events-none absolute top-0 left-0 block">
        <svg className="-translate-1/2 overflow-visible text-accent" width="28" height="28" viewBox="-14 -14 28 28" fill="none" stroke="currentColor" strokeWidth="1">
          <circle r="6" />
          <path d="M-14 0H14M0 -14V14" />
        </svg>
      </span>
      <span ref={mark2} aria-hidden data-no-print className="pointer-events-none absolute top-0 left-0 block">
        <svg className="-translate-1/2 overflow-visible text-ink" width="20" height="20" viewBox="-10 -10 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2">
          <circle r="9" />
        </svg>
      </span>
    </div>
  );
}
