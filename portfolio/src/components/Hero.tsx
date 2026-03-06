"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ColorBends from "./ColorBends";

type HistoryLine = {
  prompt: string;
  cmd: string;
  out: string;
  outColor?: string;
};

const HISTORY: HistoryLine[] = [
  {
    prompt: "~/beyond_transformer $",
    cmd: "git clone https://github.com/kaelvalen/beyond_transformer",
    out: "Cloning into 'beyond_transformer'... done.",
    outColor: "text-text-muted",
  },
  {
    prompt: "~/beyond_transformer $",
    cmd: "python benchmark.py --arch mamba",
    out: "✓  Mamba-130M  |  2.1ms/token  |  O(n) memory",
    outColor: "text-accent-green",
  },
  {
    prompt: "~/beyond_transformer $",
    cmd: "python benchmark.py --arch transformer",
    out: "✗  GPT-130M    |  8.7ms/token  |  O(n²) memory",
    outColor: "text-red-400",
  },
];

const ACTIVE_COMMANDS = [
  "python train.py --model mamba --seq_len 8192",
  "nvcc -O3 flash_attention_v2.cu -o flash_attn",
  "python benchmark.py --compare transformer,mamba,rwkv",
  "cargo build --release --features cuda",
  "git commit -m 'feat: selective state-space mechanism'",
];

const TYPING_SPEED = 38;
const TYPING_JITTER = 25;
const DELETE_SPEED = 16;
const PAUSE_AFTER_TYPE = 2400;

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  // History lines: each typed char by char
  const [historyVisible, setHistoryVisible] = useState<
    { cmd: string; out: string | null; outColor: string }[]
  >([]);
  const [historyPhase, setHistoryPhase] = useState<"typing-cmd" | "showing-out" | "done">("typing-cmd");
  const [historyLineIndex, setHistoryLineIndex] = useState(0);
  const [historyCharIndex, setHistoryCharIndex] = useState(0);

  // Active (bottom) line
  const [activeText, setActiveText] = useState("");
  const [activeCmdIndex, setActiveCmdIndex] = useState(0);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [activeDeleting, setActiveDeleting] = useState(false);
  const [historyDone, setHistoryDone] = useState(false);

  // Animate history lines first
  useEffect(() => {
    if (historyDone) return;
    const line = HISTORY[historyLineIndex];
    if (!line) {
      const t = setTimeout(() => setHistoryDone(true), 0);
      return () => clearTimeout(t);
    }

    if (historyPhase === "typing-cmd") {
      if (historyCharIndex < line.cmd.length) {
        const t = setTimeout(() => {
          setHistoryVisible((prev) => {
            const next = [...prev];
            if (!next[historyLineIndex]) {
              next[historyLineIndex] = { cmd: "", out: null, outColor: line.outColor ?? "text-text-muted" };
            }
            next[historyLineIndex] = {
              ...next[historyLineIndex],
              cmd: line.cmd.slice(0, historyCharIndex + 1),
            };
            return next;
          });
          setHistoryCharIndex((c) => c + 1);
        }, TYPING_SPEED + Math.random() * TYPING_JITTER);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setHistoryPhase("showing-out"), 300);
        return () => clearTimeout(t);
      }
    }

    if (historyPhase === "showing-out") {
      const t = setTimeout(() => {
        setHistoryVisible((prev) => {
          const next = [...prev];
          next[historyLineIndex] = { ...next[historyLineIndex], out: line.out };
          return next;
        });
        setHistoryPhase("typing-cmd");
        setHistoryCharIndex(0);
        setHistoryLineIndex((i) => i + 1);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [historyDone, historyLineIndex, historyPhase, historyCharIndex]);

  // Active line typing loop (only after history is done)
  useEffect(() => {
    if (!historyDone) return;
    const current = ACTIVE_COMMANDS[activeCmdIndex];
    if (!activeDeleting && activeCharIndex < current.length) {
      const t = setTimeout(() => {
        setActiveText(current.slice(0, activeCharIndex + 1));
        setActiveCharIndex((c) => c + 1);
      }, TYPING_SPEED + Math.random() * TYPING_JITTER);
      return () => clearTimeout(t);
    }
    if (!activeDeleting && activeCharIndex === current.length) {
      const t = setTimeout(() => setActiveDeleting(true), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }
    if (activeDeleting && activeCharIndex > 0) {
      const t = setTimeout(() => {
        setActiveText(current.slice(0, activeCharIndex - 1));
        setActiveCharIndex((c) => c - 1);
      }, DELETE_SPEED);
      return () => clearTimeout(t);
    }
    if (activeDeleting && activeCharIndex === 0) {
      const t = setTimeout(() => {
        setActiveDeleting(false);
        setActiveCmdIndex((i) => (i + 1) % ACTIVE_COMMANDS.length);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [historyDone, activeDeleting, activeCharIndex, activeCmdIndex]);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(spacerRef.current, { opacity: 0, duration: 0.3 })
        .from(headingRef.current, { opacity: 0, y: 30, duration: 0.7 }, "-=0.1")
        .from(subRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from(descRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
        .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
        .from(termRef.current, { opacity: 0, y: 30, scale: 0.97, duration: 0.6 }, "-=0.2")
        .from(scrollRef.current, { opacity: 0, y: -10, duration: 0.4 }, "-=0.1");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden w-full"
    >
      <div className="absolute inset-0">
        <ColorBends
          colors={["#e53e3e", "#ffffff", "#c53030"]}
          rotation={-1}
          speed={0}
          scale={0.1}
          frequency={1.0}
          warpStrength={1}
          mouseInfluence={0}
          parallax={0}
          noise={0.219}
          transparent
          autoRotate={-5}
        />
      </div>
      <div className="absolute inset-0 bg-bg/40" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center min-w-0">
        {/* Spacer where badges were */}
        <div ref={spacerRef} className="h-8 mb-2" />

        <h1 ref={headingRef} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-3">
          <span className="bg-linear-to-r from-accent via-accent-pink to-accent bg-clip-text text-transparent bg-size-[200%] animate-gradient">
            Kael Valen
          </span>
        </h1>

        <p ref={subRef} className="text-xl sm:text-2xl text-text-secondary font-light mb-6">
          Building Beyond Transformer
        </p>

        <p ref={descRef} className="text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed px-2">
          Researching{" "}
          <strong className="text-text">non-transformer architectures</strong>{" "}
          through systematic implementation. Not just reading papers — building
          Mamba, RWKV, Flash Attention from scratch.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-3 justify-center mb-14">
          <a
            href="#research"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all duration-200 hover:shadow-[0_0_24px_rgba(229,62,62,0.5)]"
          >
            View Research
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-accent text-accent hover:bg-accent/10 rounded-lg font-medium transition-colors"
          >
            Get In Touch
          </a>
        </div>

        {/* Terminal */}
        <div
          ref={termRef}
          className="max-w-2xl mx-auto rounded-xl border border-border overflow-hidden bg-bg-card/90 backdrop-blur text-left shadow-2xl"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-bg-secondary border-b border-border min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="flex-1 text-center text-[11px] sm:text-xs text-text-muted font-mono truncate">
              zsh — ~/beyond_transformer
            </span>
          </div>

          {/* Terminal body */}
          <div className="px-3 sm:px-4 py-3 font-mono text-[11px] sm:text-xs space-y-1.5 min-h-30">
            {/* History lines */}
            {historyVisible.map((line, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex gap-1.5 min-w-0">
                  <span className="text-accent shrink-0 hidden sm:inline">~/beyond_transformer</span>
                  <span className="text-accent-green shrink-0">$</span>
                  <span className="text-text-secondary break-all">{line.cmd}</span>
                  {i === historyLineIndex - 1 && historyPhase === "typing-cmd" && historyCharIndex === HISTORY[i]?.cmd.length && (
                    <span className="animate-pulse text-accent">▋</span>
                  )}
                </div>
                {line.out !== null && (
                  <div className={`pl-2 sm:pl-4 ${line.outColor}`}>{line.out}</div>
                )}
              </div>
            ))}

            {/* Currently typing history line (before it's committed) */}
            {!historyDone && historyLineIndex < HISTORY.length && historyPhase === "typing-cmd" && historyCharIndex > 0 && !historyVisible[historyLineIndex] && (
              <div className="flex gap-1.5 min-w-0">
                <span className="text-accent shrink-0 hidden sm:inline">~/beyond_transformer</span>
                <span className="text-accent-green shrink-0">$</span>
                <span className="text-text-secondary break-all">{HISTORY[historyLineIndex].cmd.slice(0, historyCharIndex)}</span>
                <span className="animate-pulse text-accent">▋</span>
              </div>
            )}

            {/* Active typing line */}
            {historyDone && (
              <div className="flex gap-1.5 min-w-0">
                <span className="text-accent shrink-0 hidden sm:inline">~/beyond_transformer</span>
                <span className="text-accent-green shrink-0">$</span>
                <span className="text-text break-all">{activeText}</span>
                <span className="animate-pulse text-accent shrink-0">▋</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-text-muted tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-linear-to-b from-accent to-transparent animate-bounce-slow" />
      </div>
    </section>
  );
}
