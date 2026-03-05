"use client";

import { useEffect, useState } from "react";
import ColorBends from "./ColorBends";

const commands = [
  "python train.py --model mamba --seq_len 8192",
  "cargo build --release --features cuda",
  "nvcc -O3 flash_attention_v2.cu -o flash_attn",
  "python benchmark.py --compare transformer,mamba,rwkv",
  "git commit -m 'feat: selective state-space mechanism'",
];

export default function Hero() {
  const [text, setText] = useState("");
  const [cmdIndex, setCmdIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = commands[cmdIndex];

    if (!deleting && charIndex < current.length) {
      const timeout = setTimeout(() => {
        setText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 40 + Math.random() * 30);
      return () => clearTimeout(timeout);
    }

    if (!deleting && charIndex === current.length) {
      const timeout = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setText(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 20);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setCmdIndex((cmdIndex + 1) % commands.length);
    }
  }, [charIndex, deleting, cmdIndex]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ColorBends shader background */}
      <div className="absolute inset-0">
        <ColorBends
          colors={["#865eff", "#ffffff", "#ff63d8"]}
          rotation={-1}
          speed={0}
          scale={0.1}
          frequency={1.2}
          warpStrength={1}
          mouseInfluence={0}
          parallax={0}
          noise={0.219}
          transparent
          autoRotate={-5}
        />
      </div>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-bg/40" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="font-mono text-accent text-sm tracking-widest uppercase mb-4">
          ML Architecture Researcher
        </p>

        <h1 className="text-5xl sm:text-7xl font-bold mb-2">
          <span className="bg-gradient-to-r from-accent to-accent-pink bg-clip-text text-transparent">
            Kael Valen
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-text-secondary font-light mb-8">
          Building Beyond Transformer
        </p>

        <p className="text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Researching <strong className="text-text">non-transformer architectures</strong> through
          systematic implementation. Not just reading papers — building Mamba,
          RWKV, Flash Attention from scratch.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-14">
          <a
            href="#research"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
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
        <div className="max-w-xl mx-auto rounded-lg border border-border overflow-hidden bg-bg-card/80 backdrop-blur text-left">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border-b border-border">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-text-muted font-mono">
              ~/research
            </span>
          </div>
          <div className="px-4 py-3 font-mono text-sm">
            <span className="text-accent-green">$</span>{" "}
            <span className="text-text">{text}</span>
            <span className="animate-pulse text-accent">|</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-text-muted tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-accent to-transparent" />
      </div>
    </section>
  );
}
