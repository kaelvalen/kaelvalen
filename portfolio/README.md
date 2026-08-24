# kaelvalen · Personal Research Portfolio

Personal academic and research portfolio website for **Mehmet Arda Hakbilen (kael valen)**, focusing on efficient sequence architectures, state-space duality (SSD), and distributed systems work.

Live: [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom CSS theme tokens
- **Typography**: IBM Plex Serif & IBM Plex Mono via `next/font/google`
- **Graphics**: Zero-dependency custom SVG spline charts & tensor layout diagrams
- **Accessibility**: WCAG AA/AAA compliant color contrast (`--color-muted`: 5.35:1, `--color-accent-deep`: 8.01:1)

---

## Key Components & Architecture

- **`ArchitectureDiagram.tsx`**:
  Interactive dual-mode SVG engine:
  1. *ENGRAM Hybrid*: Block layout explorer for Mamba-2 SSD + Gated Delta Rule (GDR) and Mixture-of-Memory (MoM) router.
  2. *Trainscope Flight Recorder*: Multi-signal loss spike visualization featuring Catmull-Rom cubic spline interpolation, CUSUM drift detection, activation Kurtosis alerts, and real-time Learning Rate surge simulation.
- **`CommandPalette.tsx`**:
  Keyboard-native command launcher (`⌘K`, `Ctrl+K`, or `/`) enabling instant navigation, repository access, and email copying.
- **`Projects.tsx`**:
  Live category filterable project directory (`All`, `ML & Research`, `Systems`, `Apps & Tools`).
- **`Research.tsx`**:
  Prose and benchmark breakdown for the ENGRAM sequence architecture (PTB-XL, Speech Commands, sCIFAR-10) with constrained line widths (`max-w-prose`) for optimal reading rhythm.
- **`Contact.tsx`**:
  Fluid responsive contact section with click-to-copy email feedback.

---

## Getting Started

### Prerequisites
- Node.js 20+ or Bun 1.1+

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/kaelvalen/kaelvalen.git
cd kaelvalen/portfolio

# Install dependencies
bun install
# or: npm install

# Start development server with Turbopack
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
bun run build
# or: npx next build
```
Generates an optimized static export ready for Vercel / Edge deployment.
