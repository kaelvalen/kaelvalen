"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { THEME_CHANGE, useTheme } from "@/lib/theme";
import type { BasinId } from "@/lib/landscape";
import SheetLink from "./SheetLink";

export const BASIN_NAMES: Record<BasinId, string> = {
  relic: "RELIC",
  weightsmith: "Weightsmith",
  "latch-lang": "latch-lang",
  measure: "measure",
  connor: "connor",
  noesis: "NOESIS",
};

// Scene geometry, in Schwarzschild radii (r_s = 1). The camera sits `dist` from the hole and FOCAL
// is the screen-plane distance of the pinhole, so one r_s at the hole spans k·FOCAL/dist pixels.
const FOCAL = 1.63;
const REST = 50; // where the camera settles after the opening dolly
const INTRO = { from: 120, seconds: 3.6 };
const DIVE_END = 3; // how close the dive gets before the shadow swallows the screen

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Where the hole sits and how big it is, in CSS pixels; the shader and the particle layer share it. */
function frame(w: number, h: number, dist: number, dive: number) {
  const narrow = w < 900;
  const k = narrow ? Math.min(h, w * 1.1) : h;
  // During the dive the camera turns onto the hole, so it drifts to the middle of the screen.
  const c = ease(dive * 1.4);
  const cx = w * (narrow ? 0.5 : 0.66 + (0.5 - 0.66) * c);
  const cy = h * (narrow ? 0.3 + 0.2 * c : 0.4 + 0.1 * c);
  return { cx, cy, k, rs: (k * FOCAL) / dist };
}

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Null geodesics in Schwarzschild, integrated in Cartesian form: x'' = -1.5 h² x / r⁵.
// The disk is thin, starts at the ISCO (3 r_s) and glows with the Novikov–Thorne profile; its colour
// is a blackbody at the observed temperature, Doppler- and gravitationally shifted. Behind it, a
// galaxy band with dust lanes, lensed like everything else.
const FS = `
precision highp float;
uniform vec2 uCenter;   // device pixels, y up
uniform float uK;       // device pixels per unit of screen plane
uniform float uTime;
uniform float uDist;    // camera distance, r_s
uniform float uDive;    // 0..1 while the reader scrolls into the hole
uniform float uExpo;    // exposure, for the opening fade-in
uniform vec2 uLook;
uniform float uInk;     // 1: day, drawn as Luminet drew it in 1979, dots of ink on white paper
uniform float uCell;    // ink: one possible dot per cell, device pixels
uniform float uDotR;    // ink: dot radius, device pixels
uniform float uBuild;   // ink: share of the dots laid down so far (the opening)
uniform vec3 uWipe;     // a change of sky: this scene shows inside a circle (centre, radius); 0 for all

const float F = ${FOCAL};
const float RIN = 3.0;
const float ROUT = 15.0;
const float R0 = 20.0; // integrate only inside this sphere; outside it the weak-field bend is exact enough

float hash(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

// Planck's law at three wavelengths, normalised: the hue of a blackbody at T kelvin.
vec3 blackbody(float T) {
  vec3 l = vec3(0.610, 0.549, 0.468) * 1e-6;
  vec3 b = 1.0 / (l * l * l * l * l * (exp(1.4388e-2 / (l * T)) - 1.0));
  return b / max(b.r, max(b.g, b.b));
}

// Disk texture in the co-rotating frame. Keplerian shear winds any pattern into rings, so two
// phases of a 14 s cycle are cross-faded to keep the streaks short.
float diskTexture(vec2 xz, float r) {
  float om = 5.8 * sqrt(0.5 / (r * r * r));
  float t1 = mod(uTime, 14.0), t2 = mod(uTime + 7.0, 14.0);
  float w = abs(t1 / 7.0 - 1.0);
  float a1 = om * t1, a2 = om * t2;
  vec2 p1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1)) * xz;
  vec2 p2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2)) * xz;
  float n = mix(fbm(vec3(p1 * 0.8, 3.1)), fbm(vec3(p2 * 0.8, -5.7)), w);
  return 0.35 + 1.1 * n * n + 0.15 * sin(r * 5.0 + n * 5.0);
}

// The galaxy: a band around a tilted great circle, a warm bulge, dark dust lanes, a few
// hydrogen-alpha knots. Directions are world-space, so the lens bends it like the stars.
// The band runs diagonally behind the hole; its bulge sits up and to the left of it.
const vec3 POLE = vec3(-0.49, 0.86, 0.14);
const vec3 CORE0 = vec3(-0.42, -0.1, 1.0);
float band(vec3 d) { float l = dot(d, POLE); return exp(-l * l / 0.008); }
vec3 galaxy(vec3 d) {
  vec3 core = normalize(CORE0 - POLE * dot(CORE0, POLE));
  float lat = dot(d, POLE);
  float b = exp(-lat * lat / 0.008);
  float bulge = exp(-(1.0 - dot(d, core)) * 30.0) * exp(-lat * lat / 0.02);
  float cloud = fbm(d * 9.0);
  cloud = cloud * cloud * cloud * 3.0;
  float dust = smoothstep(0.45, 0.68, fbm(d * 14.0 + 4.0)) * exp(-lat * lat / 0.0025);
  vec3 col = vec3(0.72, 0.78, 0.95) * b * (0.08 + cloud) + vec3(1.0, 0.8, 0.6) * bulge * 0.9;
  col *= 1.0 - 0.92 * dust;
  float ha = smoothstep(0.7, 0.88, fbm(d * 22.0 - 2.0)) * b * (1.0 - dust);
  col += vec3(1.0, 0.25, 0.32) * ha * 0.35;
  return col * 0.1;
}

// One star layer: s cells per radian; each cell holds a star with probability that rises in the band.
// The footprint is measured across the view direction, and stretched along e by len (cells) for the dive.
vec3 starLayer(vec3 d, float s, float thr, vec3 e, float len) {
  vec3 c = floor(d * s), f = fract(d * s) - 0.5;
  float h = hash(c);
  if (h < thr) return vec3(0.0);
  vec3 o = vec3(hash(c + 3.1), hash(c + 7.7), hash(c + 1.3)) - 0.5;
  vec3 q = f - o * 0.5;
  q -= dot(q, d) * d;
  float along = dot(q, e);
  vec2 k = vec2(max(abs(along + len * 0.5) - len * 0.5, 0.0), length(q - along * e));
  float mag = pow(hash(c + 9.0), 6.0) * 5.0 + 0.4;
  vec3 tint = blackbody(mix(3200.0, 14000.0, hash(c + 5.0)));
  return tint * mag * smoothstep(0.17, 0.0, length(k)) / (1.0 + len * 0.6);
}
vec3 sky(vec3 d, vec3 fw) {
  vec3 e = d - fw * dot(d, fw);
  e = length(e) > 1e-4 ? normalize(e) : vec3(1.0, 0.0, 0.0);
  float bnd = band(d);
  float len = uDive * uDive * 22.0;
  vec3 col = galaxy(d);
  col += starLayer(d, 300.0, 0.994 - 0.02 * bnd, e, len * 2.5) * 0.35;
  col += starLayer(d, 110.0, 0.993 - 0.012 * bnd, e, len) * 0.8;
  return col;
}

vec3 aces(vec3 x) { return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

// Traces the ray through one screen point: the disk's light and the corona's, how much of the
// background still shows through, and where the ray leaves for (if it does).
vec3 trace(vec2 frag, out float halo, out float trans, out bool escaped, out vec3 dir, out vec3 fw) {
  vec2 uv = (frag - uCenter) / uK;

  float el = 0.2 + uLook.y + 0.12 * uDive, az = uLook.x - uTime * 0.006;
  vec3 pos = uDist * vec3(sin(az) * cos(el), sin(el), -cos(az) * cos(el));
  fw = -normalize(pos);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  dir = normalize(uv.x * rt + uv.y * up + F * fw);

  vec3 hv = cross(pos, dir);
  float h2 = dot(hv, hv);
  float b = sqrt(h2);

  vec3 emit = vec3(0.0);
  halo = 0.0;
  trans = 1.0;
  escaped = false;

  if (b > ROUT + 1.0) {
    // Rays passing wide of the disk: bend them by the weak-field angle 2/b + 15π/16b² in closed form.
    float a = 2.0 / b + 2.945 / h2;
    vec3 n = -normalize(pos - dot(pos, dir) * dir);
    dir = dir * cos(a) + n * sin(a);
    escaped = true;
  } else {
    // Fly straight to the R0 sphere; the bend picked up outside it is under 0.01 rad.
    if (length(pos) > R0) pos += dir * (-dot(pos, dir) - sqrt(max(0.0, R0 * R0 - b * b)));
    for (int i = 0; i < 220; i++) {
      float r = length(pos);
      if (r < 1.0) break;
      if (r > max(R0, uDist) + 0.1 && dot(pos, dir) > 0.0) { escaped = true; break; }
      float dt = clamp(0.07 * r, 0.03, 1.5);
      vec3 prev = pos;
      dir += -1.5 * h2 * pos / (r * r * r * r * r) * dt;
      pos += dir * dt;
      // A thin hot corona above the disk: soft light the rays pick up on their way through.
      halo += trans * exp(-abs(pos.y) * 2.2) * smoothstep(2.2, 3.4, r) * exp(-r * 0.22) * dt;
      if (prev.y * pos.y < 0.0) {
        vec3 hit = mix(prev, pos, prev.y / (prev.y - pos.y));
        float rh = length(hit.xz);
        if (rh > RIN && rh < ROUT) {
          // Novikov–Thorne temperature, peak normalised to 1 near r = 4.1.
          float tn = pow(rh, -0.75) * pow(1.0 - sqrt(RIN / rh), 0.25) / 0.214;
          float beta = sqrt(0.5 / (rh - 1.0));
          vec3 v = normalize(vec3(-hit.z, 0.0, hit.x));
          float cosA = dot(v, -normalize(dir));
          float g = sqrt(1.0 - 1.0 / rh) * sqrt(1.0 - beta * beta) / (1.0 - beta * cosA);
          float T = 6000.0 * tn * g;
          float rad = smoothstep(RIN, RIN + 0.4, rh) * (1.0 - smoothstep(7.0, ROUT, rh));
          float dens = rad * diskTexture(hit.xz, rh);
          emit += trans * blackbody(T) * pow(T / 6000.0, 3.5) * dens * 1.2;
          trans *= 1.0 - clamp(dens * 1.6, 0.0, 1.0);
          if (trans < 0.02) break;
        }
      }
    }
  }
  return emit;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float halo, trans;
  bool escaped;
  vec3 dir, fw;
  vec3 col;
  if (uInk > 0.5) {
    // One dot per cell at most, jittered off the grid, set with probability equal to the light there:
    // equal dots, more of them where the disk is brighter, as in Luminet's drawing.
    vec2 cell = floor(frag / uCell);
    vec2 c = (cell + 0.5 + (vec2(hash(vec3(cell, 1.0)), hash(vec3(cell, 2.0))) - 0.5) * 0.85) * uCell;
    vec3 e = 1.0 - exp(-trace(c, halo, trans, escaped, dir, fw) * 1.3);
    float p = pow(clamp(dot(e, vec3(0.3, 0.55, 0.15)) * 2.4, 0.0, 1.0), 0.85);
    p *= 1.0 - smoothstep(0.45, 0.95, uDive); // the dots thin out into the page during the dive
    // (hash can be exactly 0; the offset keeps empty paper empty)
    float on = step(hash(vec3(cell, 3.0)) + 1e-3, p) * step(hash(vec3(cell, 4.0)) + 1e-3, uBuild);
    col = mix(vec3(1.0), vec3(0.06, 0.055, 0.05), on * (1.0 - smoothstep(uDotR - 0.6, uDotR + 0.6, length(frag - c))));
  } else {
    vec3 emit = trace(frag, halo, trans, escaped, dir, fw);
    vec3 hdr = emit + blackbody(3600.0) * halo * 0.05;
    if (escaped) hdr += trans * sky(normalize(dir), fw);
    col = aces(hdr * uExpo * 1.4);
    col = max(mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 1.2), 0.0);

    // Film: a soft vignette and a little grain, so the dark sky is not a flat fill.
    col *= 1.0 - 0.25 * smoothstep(0.35, 1.4, length((gl_FragCoord.xy - uCenter) / uK));
    col += (hash(vec3(gl_FragCoord.xy, floor(uTime * 24.0))) - 0.5) * 0.018 * (1.0 - col);
    col = max(col, 0.0);

    // Warp: past the middle of the dive, light-speed streaks rush out from the hole across the frame.
    float wv = smoothstep(0.4, 0.75, uDive) * (1.0 - smoothstep(0.88, 0.97, uDive));
    if (wv > 0.0) {
      vec2 sp = (gl_FragCoord.xy - uCenter) / uK;
      float rad = length(sp);
      float lanes = atan(sp.y, sp.x) * 110.0;
      float lane = floor(lanes);
      float h = hash(vec3(lane, 3.0, 7.0));
      float thin = smoothstep(0.32, 0.0, abs(fract(lanes) - 0.5));
      float seg = fract(log(rad + 0.05) * 1.3 - uDive * 9.0 - uTime * 0.7 * (0.5 + h) - h * 13.0);
      float streak = step(0.72, h) * thin * smoothstep(0.0, 0.06, seg) * (1.0 - smoothstep(0.06, 0.55, seg)) * smoothstep(0.12, 0.45, rad);
      col += mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.9, 0.8), hash(vec3(lane, 1.0, 1.0))) * streak * wv * (0.6 + rad);
    }
  }
  float inside = 1.0 - smoothstep(uWipe.z - 1.5, uWipe.z + 1.5, length(frag - uWipe.xy));
  gl_FragColor = vec4(col, uWipe.z > 0.5 ? inside : 1.0);
}
`;

type Particle = { x: number; y: number; vx: number; vy: number; trail: number[]; swept: number; done: boolean; age: number };

// Test particles in the sky plane, in r_s and r_s/c. Newtonian pull plus the Schwarzschild
// L²/r⁴ term, which is what makes orbits precess and plunge inside 3 r_s.
const M = 0.5;
const accel = (x: number, y: number, vx: number, vy: number) => {
  const r2 = x * x + y * y;
  const r = Math.sqrt(r2);
  const L = x * vy - y * vx;
  const m = -(M / r2 + (3 * M * L * L) / (r2 * r2)) / r;
  return [x * m, y * m] as const;
};
function step(p: Particle, dt: number) {
  const [ax, ay] = accel(p.x, p.y, p.vx, p.vy);
  p.vx += ax * dt;
  p.vy += ay * dt;
  const a0 = Math.atan2(p.y, p.x);
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  let da = Math.atan2(p.y, p.x) - a0;
  if (da > Math.PI) da -= 2 * Math.PI;
  if (da < -Math.PI) da += 2 * Math.PI;
  p.swept += da;
}
const SIM_RATE = 34; // r_s/c of simulated time per second

export default function Hero() {
  const { t } = useI18n();
  const h = t.hero;
  const { theme } = useTheme();
  const track = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLElement>(null);
  const glCanvas = useRef<HTMLCanvasElement>(null);
  const fxCanvas = useRef<HTMLCanvasElement>(null);
  // Shared by the renderer and the particle layer: camera distance and dive progress.
  const cam = useRef({ dist: REST, dive: 0 });
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ kind: "fell" | "captured" | "escaped"; orbits: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The black hole, and the dive into it as the reader scrolls on.
  useEffect(() => {
    const cv = glCanvas.current;
    const el = box.current;
    const tr = track.current;
    const gl = cv?.getContext("webgl", { antialias: false, alpha: false });
    if (!cv || !el || !tr || !gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VS);
    const fs = sh(gl.FRAGMENT_SHADER, FS);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("black hole shader:", gl.getShaderInfoLog(fs));
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const [uCenter, uK, uTime, uDist, uDive, uExpo, uLook, uInk, uCell, uDotR, uBuild, uWipe] = [
      "uCenter", "uK", "uTime", "uDist", "uDive", "uExpo", "uLook", "uInk", "uCell", "uDotR", "uBuild", "uWipe",
    ].map(u);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let still = reduced; // one frame per change instead of a loop
    let software = false; // GL too slow to redraw even on scroll
    let quality = 0.35;
    let day = document.documentElement.dataset.theme === "light";
    // A change of sky: the new scene opens out of the hole in a widening circle over the old one.
    let change: { from: boolean; at: number } | null = null;
    const CHANGE_MS = 1500;
    let visible = true;
    let raf = 0;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      cv.width = Math.round(el.clientWidth * quality);
      cv.height = Math.round(el.clientHeight * quality);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    // How far the hero has slid inside its track: 0 at rest, 1 when the scene has handed over to the page.
    const readDive = () => {
      const room = tr.offsetHeight - el.offsetHeight;
      const d = room > 0 ? Math.min(1, Math.max(0, (el.getBoundingClientRect().top - tr.getBoundingClientRect().top) / room)) : 0;
      cam.current.dive = d;
      el.style.setProperty("--dive", d.toFixed(4));
      return d;
    };

    const t0 = performance.now();
    let last = t0;
    let slow = 0;
    // Draws one scene. Night: the black hole in its own light, with the opening dolly. Day: the same
    // hole as Luminet drew it in 1979, still, its dots laid down one by one on load.
    const scene = (ink: boolean, s: number, dive: number, wipe: number) => {
      const rest = ink ? REST : INTRO.from + (REST - INTRO.from) * ease(s / INTRO.seconds);
      const dist = rest * Math.pow(DIVE_END / REST, Math.pow(dive, 1.5));
      cam.current.dist = dist;
      const f = frame(el.clientWidth, el.clientHeight, dist, dive);
      gl.uniform2f(uCenter, f.cx * quality, cv.height - f.cy * quality);
      gl.uniform1f(uK, f.k * quality);
      gl.uniform1f(uTime, reduced || ink ? 30 : s + 30);
      gl.uniform1f(uDist, dist);
      gl.uniform1f(uDive, dive);
      gl.uniform1f(uExpo, ink ? 1 : ease(s / 1.6));
      gl.uniform2f(uLook, ink ? 0 : look.x, ink ? 0 : look.y);
      gl.uniform1f(uInk, ink ? 1 : 0);
      // Dots scale with the picture, so a phone gets a smaller drawing, not a coarser one.
      const cell = Math.min(3.8, Math.max(2.2, f.k / 290));
      gl.uniform1f(uCell, cell * quality);
      gl.uniform1f(uDotR, Math.max(0.8, cell * 0.4 * quality));
      gl.uniform1f(uBuild, reduced ? 1 : ease(s / 3.2));
      gl.uniform3f(uWipe, f.cx * quality, cv.height - f.cy * quality, wipe * quality);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const draw = (now: number, force?: "night") => {
      // Shed resolution, never frames: after a run of slow frames, render fewer pixels.
      if (!still && now - last > 28 && quality > 0.55 && ++slow > 20) {
        quality *= 0.8;
        slow = 0;
        resize();
      }
      last = now;
      look.x += (look.tx - look.x) * 0.04;
      look.y += (look.ty - look.y) * 0.04;
      const s = reduced ? 1e9 : (now - t0) / 1000;
      const dive = cam.current.dive;
      if (force) return scene(false, s, dive, 0);
      const t = change ? (now - change.at) / CHANGE_MS : 1;
      if (!change || t >= 1) {
        change = null;
        return scene(day, s, dive, 0);
      }
      // The old scene, then the new one inside a circle that opens from the hole to the corners.
      scene(change.from, s, dive, 0);
      const far = Math.hypot(el.clientWidth, el.clientHeight);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(2 - 2 * t, 3) / 2;
      gl.enable(gl.BLEND);
      scene(day, s, dive, Math.max(1, e * far));
      gl.disable(gl.BLEND);
    };
    const loop = (now: number) => {
      draw(now);
      raf = visible && !still ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (still) {
        if (!raf) raf = requestAnimationFrame((now) => ((raf = 0), draw(now)));
      } else if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      look.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.12;
      look.ty = ((e.clientY - r.top) / r.height - 0.5) * -0.06;
    };
    const onScroll = () => {
      readDive();
      if (!software) kick();
    };
    const onSky = () => {
      const next = document.documentElement.dataset.theme === "light";
      if (next === day) return;
      if (!still && visible) change = { from: day, at: performance.now() };
      day = next;
      kick();
    };
    // Only animate while a good part of the scene is on screen, not a sliver under the nav.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio > 0.2;
        kick();
      },
      { threshold: [0, 0.2] }
    );
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });

    readDive();
    resize();
    // Time one small frame and pick the resolution that fits ~16 ms. Software GL (a blocklisted
    // GPU, or CI) cannot keep up at any size, so it gets one still frame instead of a crawling page.
    const px = new Uint8Array(4);
    const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // waits for the GPU; finish() does not
    // Always time the night scene: it is the expensive one, and the reader may switch to it.
    draw(performance.now(), "night");
    sync(); // the first frame pays for shader compilation; time the second
    const t1 = performance.now();
    draw(t1, "night");
    sync();
    const ms = Math.max(0.1, performance.now() - t1);
    quality = Math.min(1, devicePixelRatio || 1, 0.35 * Math.sqrt(16 / ms));
    if (quality < 0.5) {
      still = software = true;
      quality = 0.5;
    }
    resize();
    io.observe(el);
    ro.observe(el);
    if (!still) el.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(THEME_CHANGE, onSky);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(THEME_CHANGE, onSky);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  // Test particles: click drops one from rest, a drag throws it along the drag.
  useEffect(() => {
    const cv = fxCanvas.current;
    const el = box.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !el || !ctx) return;

    const parts: Particle[] = [];
    let aim: { x: number; y: number; ex: number; ey: number } | null = null;
    let raf = 0;
    let last = 0;
    let f = frame(el.clientWidth, el.clientHeight, cam.current.dist, 0);
    const dpr = () => Math.min(2, devicePixelRatio || 1);

    const resize = () => {
      cv.width = Math.round(el.clientWidth * dpr());
      cv.height = Math.round(el.clientHeight * dpr());
    };
    const toSim = (px: number, py: number) => [(px - f.cx) / f.rs, (py - f.cy) / f.rs] as const;
    // A drag of ~150 px gives about the circular speed a few hundred pixels out.
    const throwVel = (a: NonNullable<typeof aim>) => [((a.ex - a.x) / f.rs) * 0.04, ((a.ey - a.y) / f.rs) * 0.04] as const;
    const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();

    const render = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      f = frame(el.clientWidth, el.clientHeight, cam.current.dist, cam.current.dive);
      const d = dpr();
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, el.clientWidth, el.clientHeight);
      ctx.lineCap = "round";
      ctx.strokeStyle = ink();
      ctx.fillStyle = ink();

      for (const p of parts) {
        if (!p.done) {
          const n = 24;
          for (let i = 0; i < n; i++) {
            step(p, (dt * SIM_RATE) / n);
            const r = Math.hypot(p.x, p.y);
            if (r < 1 || r > 80) {
              p.done = true;
              p.age = 0;
              setStatus({ kind: r < 1 ? (Math.abs(p.swept) < Math.PI ? "fell" : "captured") : "escaped", orbits: Math.floor(Math.abs(p.swept) / (2 * Math.PI)) });
              break;
            }
          }
          p.trail.push(p.x, p.y);
          if (p.trail.length > 600) p.trail.splice(0, 2);
        }
        p.age += dt;
        // Dim toward the horizon (redshift) and, once finished, fade away entirely.
        const fade = p.done ? Math.max(0, 1 - p.age / 2.5) : 1;
        const n = p.trail.length / 2;
        for (let i = 1; i < n; i++) {
          const r = Math.hypot(p.trail[2 * i], p.trail[2 * i + 1]);
          ctx.globalAlpha = (i / n) * 0.85 * fade * Math.sqrt(Math.max(0, 1 - 1 / r));
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(f.cx + p.trail[2 * i - 2] * f.rs, f.cy + p.trail[2 * i - 1] * f.rs);
          ctx.lineTo(f.cx + p.trail[2 * i] * f.rs, f.cy + p.trail[2 * i + 1] * f.rs);
          ctx.stroke();
        }
        if (!p.done) {
          ctx.globalAlpha = Math.sqrt(Math.max(0, 1 - 1 / Math.hypot(p.x, p.y)));
          ctx.beginPath();
          ctx.arc(f.cx + p.x * f.rs, f.cy + p.y * f.rs, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].done && parts[i].age > 2.5) parts.splice(i, 1);

      if (aim) {
        // The path the throw would take, from the same integrator.
        const [x, y] = toSim(aim.x, aim.y);
        const [vx, vy] = throwVel(aim);
        const g: Particle = { x, y, vx, vy, trail: [], swept: 0, done: false, age: 0 };
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(aim.x, aim.y);
        for (let i = 0; i < 900 && Math.hypot(g.x, g.y) > 1 && Math.hypot(g.x, g.y) < 80; i++) {
          step(g, 0.25);
          ctx.lineTo(f.cx + g.x * f.rs, f.cy + g.y * f.rs);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      raf = parts.length || aim ? requestAnimationFrame(render) : 0;
      if (!raf) last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || cam.current.dive > 0.02 || (e.target as Element).closest("a, button, [data-hero-copy], [data-hero-note]")) return;
      const [x, y] = local(e);
      f = frame(el.clientWidth, el.clientHeight, cam.current.dist, 0);
      aim = { x, y, ex: x, ey: y };
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!aim) return;
      [aim.ex, aim.ey] = local(e);
    };
    const onUp = () => {
      if (!aim) return;
      const [x, y] = toSim(aim.x, aim.y);
      if (Math.hypot(x, y) > 1.2) {
        const [vx, vy] = Math.hypot(aim.ex - aim.x, aim.ey - aim.y) > 6 ? throwVel(aim) : [0, 0];
        parts.push({ x, y, vx, vy, trail: [x, y], swept: 0, done: false, age: 0 });
        if (parts.length > 5) parts.shift();
      }
      aim = null;
      kick();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

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

  return (
    // The track gives the hero one extra screen of scroll: the hero stays pinned while the camera dives.
    <div ref={track} id="top-track" className="relative">
      <header
        ref={box}
        id="top"
        data-sheet-id="top"
        className="sticky top-0 h-[100dvh] max-h-[1100px] min-h-[720px] cursor-crosshair touch-pan-y overflow-hidden bg-paper select-none sm:min-h-[600px]"
      >
        <canvas ref={glCanvas} role="img" aria-label={theme === "light" ? h.sceneLabelDay : h.sceneLabel} className="absolute inset-0 h-full w-full" data-no-print />
        <canvas
          ref={fxCanvas}
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ opacity: "calc(1 - var(--dive, 0) * 20)" }}
          data-no-print
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 sm:bottom-14"
          style={{ opacity: "calc(1 - var(--dive, 0) * 3)", transform: "translateY(calc(var(--dive, 0) * -60px))" }}
        >
          <div className="mx-auto flex max-w-[1280px] items-end justify-between gap-16 px-5 sm:px-12">
            <div data-hero-copy className="pointer-events-auto max-w-[600px] cursor-auto select-text">
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
                  className="cursor-pointer text-left font-mono text-[13px] break-all text-muted transition-colors hover:text-ink"
                >
                  {h.install}
                  <span aria-live="polite" className="ml-2 font-sans text-[12px] text-accent">
                    {copied ? h.installCopied : ""}
                  </span>
                </button>
              </p>
            </div>
            <p data-hero-note className="pointer-events-auto hidden max-w-[34ch] cursor-auto text-[13px] leading-relaxed text-pretty text-muted select-text lg:block" data-no-print>
              {theme === "light" ? h.noteDay : h.note}
            </p>
          </div>
        </div>

        {/* The shadow takes the whole screen at the end of the dive; the page continues from it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-paper" style={{ opacity: "clamp(0, calc((var(--dive, 0) - 0.82) * 5.6), 1)" }} />

        <p aria-live="polite" className="sr-only">
          {status && h.particle(status.kind, status.orbits)}
        </p>
      </header>
      <div aria-hidden className="h-[100dvh] motion-reduce:hidden" data-no-print />
    </div>
  );
}
