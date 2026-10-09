# kaelvalen · Personal Research Portfolio

Personal academic and research portfolio website for **Mehmet Arda Hakbilen (kael valen)**, focusing on efficient sequence architectures, learning after deployment on frozen models, and distributed systems work.

Live: [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with semantic CSS-variable tokens (`--paper`, `--ink`, `--accent`, …) that swap per theme
- **Typography**: Instrument Serif (display), Geist (text) & Geist Mono (labels) via `next/font/google`, with `latin-ext` for Turkish
- **Theming**: light / dark, resolved before first paint (saved choice → system preference), no flash
- **i18n**: English / Türkçe, all copy in `src/lib/dictionary.ts`; language is saved and defaults to the browser language
- **Graphics**: Zero-dependency custom SVG spline charts & tensor layout diagrams
- **Accessibility**: every text/background pair meets WCAG AA (e.g. light `--muted` 5.4:1, `--accent-deep` 5.1:1; dark `--muted` 5.8:1, `--accent-deep` 7.7:1), skip link, tablist/combobox/`aria-pressed` semantics, `prefers-reduced-motion` support

---

## Key Components & Architecture

- **`Navbar.tsx`**:
  Sticky blurred header with scroll-spy, mobile menu, search, language and theme controls; `ScrollProgress.tsx` adds a reading-progress bar.
- **`ArchitectureDiagram.tsx`** (+ `diagram/`):
  Interactive dual-mode SVG engine:
  1. *CERATA* (`CerataPanel.tsx`): Architecture explorer for one fixed address space and its three time scales (FAST key-value memory, MEDIUM closed-form edit, SLOW consolidation), plus the four write guards.
  2. *Trainscope Flight Recorder* (`TrainscopePanel.tsx`): Multi-signal loss spike visualization featuring Catmull-Rom cubic spline interpolation, CUSUM drift detection, activation Kurtosis alerts, and Learning Rate surge simulation (data in `src/lib/trainscope-sim.ts`; telemetry is simulated).
- **`CommandPalette.tsx`**:
  Keyboard-native command launcher (`⌘K`, `Ctrl+K`, or `/`) for navigation, repository access, email copying, and switching theme / language.
- **`Projects.tsx`**:
  Card grid with category filters (`All`, `ML & Research`, `Systems`, `Apps & Tools`).
- **`Research.tsx`**:
  Prose and benchmark breakdown (trainscope and CERATA on CIFAR-100 / frozen ViT-B/16) with proportional accuracy bars and constrained line widths (`max-w-prose`).
- **`Contact.tsx`**:
  Mail link plus a separate copy-to-clipboard button with live-region feedback.

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
