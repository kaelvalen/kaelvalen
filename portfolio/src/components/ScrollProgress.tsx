"use client";

import { useEffect, useRef } from "react";

/** Thin reading-progress bar. Updates a CSS transform directly to avoid re-rendering on scroll. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden data-no-print className="fixed inset-x-0 top-0 z-50 h-0.5 pointer-events-none">
      <div ref={bar} className="h-full origin-left bg-accent-deep" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
