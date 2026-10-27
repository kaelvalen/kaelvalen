/**
 * The paper itself, drawn on the GPU.
 *
 * 1. A seamless 512 px tile of paper: low-frequency mottling (uneven sensitising), grain, and long
 *    fibres along both axes. Every noise octave has an integer number of lattice cells per tile, so the
 *    tile repeats without a seam. It is rendered once per medium and used as a CSS background, so it
 *    scrolls with the page and costs nothing afterwards.
 * 2. The exposure lamp: during a theme change, a UV lamp bar sweeps the viewport while the new medium
 *    develops ahead of the reveal edge in uneven blotches.
 *
 * The amplitudes are small on purpose: text contrast is measured against the flat paper colour.
 */

import type { Theme } from "./theme";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Periodic value noise: lattice coordinates wrap at `period`, so octaves tile exactly.
const NOISE = `
precision highp float;
float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}
float pnoise(vec2 p, vec2 period, float seed) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(mod(i, period) + seed);
  float b = hash(mod(i + vec2(1.0, 0.0), period) + seed);
  float c = hash(mod(i + vec2(0.0, 1.0), period) + seed);
  float d = hash(mod(i + vec2(1.0, 1.0), period) + seed);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`;

const TILE_FRAG = `${NOISE}
uniform vec2 uRes;
uniform vec3 uShade;
uniform vec3 uLight;
uniform float uAmp;

float fbm(vec2 uv, float f0, float seed) {
  float v = 0.0, a = 0.5, f = f0;
  for (int o = 0; o < 4; o++) {
    v += a * pnoise(uv * f, vec2(f), seed + float(o) * 17.0);
    f *= 2.0;
    a *= 0.5;
  }
  return v / 0.9375;
}

// Thin streaks: a ridge of strongly anisotropic noise. Frequencies are integers per axis, so it tiles.
float fibres(vec2 uv, vec2 freq, float seed) {
  float n = pnoise(uv * freq, freq, seed);
  float ridge = 1.0 - abs(2.0 * n - 1.0);
  return pow(ridge, 14.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float mottle = fbm(uv, 3.0, 1.0) - 0.5;
  float grain = pnoise(uv * 256.0, vec2(256.0), 7.0) - 0.5;
  float fib = fibres(uv, vec2(9.0, 160.0), 3.0) + fibres(uv, vec2(160.0, 9.0), 5.0) + 0.6 * fibres(uv, vec2(17.0, 96.0), 11.0);
  float m = mottle * 1.1 + grain * 0.55 - fib * 0.9;
  float a = clamp(abs(m), 0.0, 1.0) * uAmp;
  vec3 c = m < 0.0 ? uShade : uLight;
  gl_FragColor = vec4(c * a, a);
}
`;

const LAMP_FRAG = `${NOISE}
uniform vec2 uRes;
uniform float uFront;
uniform float uTime;
uniform vec3 uTo;
uniform vec3 uLamp;

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int o = 0; o < 4; o++) {
    v += a * pnoise(p, vec2(4096.0), float(o) * 13.0);
    p *= 2.03;
    a *= 0.5;
  }
  return v / 0.9375;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float d = px.x - uFront;                       // > 0: ahead of the reveal edge, still the old medium
  float n = fbm(px / 70.0 + vec2(0.0, uTime * 0.6));
  // The developing front: blotches of the new paper that run ahead of the edge.
  float reach = 10.0 + 70.0 * n;
  float develop = (1.0 - smoothstep(reach - 18.0, reach, d)) * step(0.0, d);
  float aDev = develop * 0.92;
  // The lamp: a hot core just ahead of the front, and a wide violet halo.
  float core = exp(-pow((d - 6.0) / 3.0, 2.0));
  float halo = exp(-abs(d - 6.0) / 70.0) * 0.38;
  float glow = clamp(core + halo, 0.0, 1.0);
  vec3 c = uTo * aDev * (1.0 - glow) + uLamp * glow;
  float a = clamp(aDev + glow - aDev * glow, 0.0, 1.0);
  gl_FragColor = vec4(c, a);
}
`;

function program(gl: WebGLRenderingContext, frag: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  gl.useProgram(p);
  // One triangle that covers the viewport.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return p;
}

export function rgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const MEDIA: Record<Theme, { shade: string; light: string; amp: number }> = {
  // Whiteprint: faint blue-grey shading, kept low so muted text stays above 4.5:1.
  light: { shade: "#1d2b64", light: "#ffffff", amp: 0.035 },
  // Cyanotype: deeper Prussian pooling and paler washed patches.
  dark: { shade: "#061a33", light: "#3f6fa8", amp: 0.09 },
};

const TILE = 512;
const tiles = new Map<Theme, string>();

/** Renders the paper tile for a medium and returns an object URL for it (cached). */
export async function paperTile(theme: Theme): Promise<string | null> {
  const hit = tiles.get(theme);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TILE;
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
  if (!gl) return null;
  try {
    const p = program(gl, TILE_FRAG);
    const m = MEDIA[theme];
    gl.uniform2f(gl.getUniformLocation(p, "uRes"), TILE, TILE);
    gl.uniform3fv(gl.getUniformLocation(p, "uShade"), rgb(m.shade));
    gl.uniform3fv(gl.getUniformLocation(p, "uLight"), rgb(m.light));
    gl.uniform1f(gl.getUniformLocation(p, "uAmp"), m.amp);
    gl.viewport(0, 0, TILE, TILE);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } catch {
    return null;
  }
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  tiles.set(theme, url);
  return url;
}

export const cachedTile = (theme: Theme) => tiles.get(theme) ?? null;

/** Solves a CSS cubic-bezier(x1, y1, x2, y2) timing function at time t ∈ [0, 1]. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3;
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < t) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
}

/** The lamp: owns a viewport-sized WebGL canvas that exists only while an exposure runs. */
export class ExposureLamp {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private frame = 0;
  private to: [number, number, number] = [1, 1, 1];

  /** Mounts the canvas, dark, so the transition's new snapshot already contains it. */
  mount(toPaper: string) {
    this.to = rgb(toPaper);
    if (!this.canvas) {
      const c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true");
      c.style.cssText =
        "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000;view-transition-name:exposure-lamp";
      this.canvas = c;
    }
    const c = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    c.width = Math.round(window.innerWidth * dpr);
    c.height = Math.round(window.innerHeight * dpr);
    if (!c.isConnected) document.body.appendChild(c);
    if (!this.gl) {
      this.gl = c.getContext("webgl", { premultipliedAlpha: true, antialias: false });
      if (!this.gl) return false;
      try {
        this.prog = program(this.gl, LAMP_FRAG);
      } catch {
        this.gl = null;
        return false;
      }
    }
    this.draw(-10000, 0);
    return true;
  }

  private draw(frontCss: number, time: number) {
    const { gl, prog, canvas } = this;
    if (!gl || !prog || !canvas) return;
    const scale = canvas.width / window.innerWidth;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(prog, "uRes"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(prog, "uFront"), frontCss * scale);
    gl.uniform1f(gl.getUniformLocation(prog, "uTime"), time);
    gl.uniform3fv(gl.getUniformLocation(prog, "uTo"), this.to);
    gl.uniform3fv(gl.getUniformLocation(prog, "uLamp"), rgb("#c3b2ff"));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Runs the sweep in step with the CSS reveal (same duration, same easing), then unmounts. */
  run(durationMs: number, ease: (t: number) => number) {
    cancelAnimationFrame(this.frame);
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      this.draw(ease(t) * window.innerWidth, (now - t0) / 1000);
      if (t < 1) this.frame = requestAnimationFrame(step);
      else this.unmount();
    };
    this.frame = requestAnimationFrame(step);
  }

  unmount() {
    cancelAnimationFrame(this.frame);
    this.canvas?.remove();
  }
}
