"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  desc: string;
  category: "navigation" | "repositories" | "action";
  action: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedNote, setCopiedNote] = useState(false);

  const items: Item[] = [
    {
      id: "nav-research",
      title: "01 Research · ENGRAM Architecture",
      desc: "Jump to section 01 (SSD + GDR + MoM backbone)",
      category: "navigation",
      action: () => {
        window.location.hash = "#research";
        setOpen(false);
      },
    },
    {
      id: "nav-projects",
      title: "02 Projects Index",
      desc: "Jump to section 02 (Full index of open work)",
      category: "navigation",
      action: () => {
        window.location.hash = "#projects";
        setOpen(false);
      },
    },
    {
      id: "nav-toolbox",
      title: "03 Toolbox & Hardware",
      desc: "Jump to section 03 (PyTorch, Triton, NixOS, RTX 5060)",
      category: "navigation",
      action: () => {
        window.location.hash = "#toolbox";
        setOpen(false);
      },
    },
    {
      id: "nav-contact",
      title: "04 Contact & Email",
      desc: "Jump to section 04",
      category: "navigation",
      action: () => {
        window.location.hash = "#contact";
        setOpen(false);
      },
    },
    {
      id: "repo-engram",
      title: "engram repository",
      desc: "Open github.com/kaelvalen/engram in new tab",
      category: "repositories",
      action: () => {
        window.open("https://github.com/kaelvalen/engram", "_blank");
        setOpen(false);
      },
    },
    {
      id: "repo-trainscope",
      title: "trainscope on PyPI",
      desc: "Open pypi.org/project/trainscope in new tab",
      category: "repositories",
      action: () => {
        window.open("https://pypi.org/project/trainscope/", "_blank");
        setOpen(false);
      },
    },
    {
      id: "repo-noesis",
      title: "noesis FINDINGS.md",
      desc: "Open continual learning findings on GitHub",
      category: "repositories",
      action: () => {
        window.open("https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md", "_blank");
        setOpen(false);
      },
    },
    {
      id: "act-copy-email",
      title: "Copy email address to clipboard",
      desc: "mehmetardahakbilen2005@gmail.com",
      category: "action",
      action: () => {
        navigator.clipboard.writeText("mehmetardahakbilen2005@gmail.com");
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 2000);
      },
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K, Cmd+K, or / when not typing in an input
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/60 backdrop-blur-xs font-mono">
      <div
        className="w-full max-w-xl border border-line bg-paper shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDownInMenu}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-line px-4 py-3 bg-paper">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. engram, trainscope)..."
            className="w-full bg-transparent text-ink text-xs sm:text-sm focus:outline-none placeholder:text-muted"
          />
          {copiedNote && (
            <span className="text-[10px] text-accent-deep uppercase tracking-widest shrink-0 ml-2">
              ✓ copied
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted">No matching commands</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2.5 flex items-baseline justify-between transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? "bg-ink text-paper"
                    : "text-ink hover:bg-paper-dim"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">{item.title}</div>
                  <div
                    className={`text-[11px] font-serif ${
                      selectedIndex === idx ? "text-paper/70" : "text-ink-soft"
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-mono shrink-0 ml-4 ${
                    selectedIndex === idx ? "text-paper/60" : "text-muted"
                  }`}
                >
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between border-t border-line px-4 py-2 bg-paper-dim/60 text-[10px] text-muted">
          <span>↑↓ to navigate · ↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
