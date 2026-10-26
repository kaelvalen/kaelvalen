"use client";

import { useEffect, useRef } from "react";

const TAU = 0.6;
// Above this share of the peak weight a key is drawn in the markup colour.
const HOT = 0.12;

type Key = { x: number; y: number };

/**
 * The name, sampled into a grid of dots ("keys"). The pointer is a query; every frame each dot's
 * radius is its softmax attention weight, exp(-|q - k|² / τ) normalised over all keys.
 * Without a pointer the query drifts on a slow Lissajous path; with reduced motion it stays put.
 */
export default function TensorName({
  text,
  onKeys,
  readoutQ,
  readoutPeak,
}: {
  text: string;
  onKeys: (n: number) => void;
  readoutQ: React.RefObject<HTMLElement | null>;
  readoutPeak: React.RefObject<HTMLElement | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const onKeysRef = useRef(onKeys);

  useEffect(() => {
    onKeysRef.current = onKeys;
  }, [onKeys]);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let keys: Key[] = [];
    let weights = new Float32Array(0);
    let ink = "0,0,0";
    let accent = "255,0,0";
    let pointer: Key | null = null;
    const q: Key = { x: 0, y: 0 };
    let frame = 0;
    let visible = true;
    const t0 = performance.now();

    const rgb = (v: string) => {
      const h = v.trim().replace("#", "");
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
    };
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
      const o = off.getContext("2d");
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
      const step = Math.max(3, Math.round((W < 700 * dpr ? 4 : 5) * dpr));
      keys = [];
      for (let y = step / 2; y < H; y += step)
        for (let x = step / 2; x < W; x += step)
          if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128) keys.push({ x, y });
      weights = new Float32Array(keys.length);
      q.x = W * 0.3;
      q.y = H * 0.5;
      onKeysRef.current(keys.length);
    };

    const draw = (now: number) => {
      const W = c.width;
      const H = c.height;
      const tt = (now - t0) / 1000;
      const target = pointer ?? (still ? { x: W * 0.3, y: H * 0.5 } : { x: W * (0.5 + 0.42 * Math.sin(tt * 0.35)), y: H * (0.5 + 0.28 * Math.sin(tt * 0.7)) });
      q.x += (target.x - q.x) * (still ? 1 : 0.12);
      q.y += (target.y - q.y) * (still ? 1 : 0.12);

      const scale = W * 0.08;
      let max = -Infinity;
      for (let i = 0; i < keys.length; i++) {
        const dx = (keys[i].x - q.x) / scale;
        const dy = (keys[i].y - q.y) / scale;
        const s = -(dx * dx + dy * dy) / TAU;
        weights[i] = s;
        if (s > max) max = s;
      }
      let z = 0;
      for (let i = 0; i < weights.length; i++) {
        weights[i] = Math.exp(weights[i] - max);
        z += weights[i];
      }

      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < keys.length; i++) {
        const rel = weights[i]; // share of the peak weight, in [0, 1]
        const hot = rel > HOT;
        ctx.fillStyle = `rgba(${hot ? accent : ink},${hot ? 0.65 + 0.35 * rel : 0.5 + rel * 2})`;
        ctx.beginPath();
        ctx.arc(keys[i].x, keys[i].y, (0.95 + 2.3 * rel) * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Query marker, drawn as a drafting centre mark.
      const m = 14 * dpr;
      ctx.strokeStyle = `rgba(${accent},0.95)`;
      ctx.lineWidth = dpr;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 6 * dpr, 0, Math.PI * 2);
      ctx.moveTo(q.x - m, q.y);
      ctx.lineTo(q.x + m, q.y);
      ctx.moveTo(q.x, q.y - m);
      ctx.lineTo(q.x, q.y + m);
      ctx.stroke();

      if (readoutQ.current) readoutQ.current.textContent = `${(q.x / W).toFixed(2)}, ${(q.y / H).toFixed(2)}`;
      if (readoutPeak.current) readoutPeak.current.textContent = z > 0 ? (1 / z).toFixed(4) : "0";
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
    document.fonts.ready.then(start);

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
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", kick);
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerleave", onLeave);
    };
  }, [text, readoutQ, readoutPeak]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="block h-[clamp(140px,21vw,320px)] w-full touch-pan-y"
    />
  );
}
