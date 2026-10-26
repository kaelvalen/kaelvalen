# kaelvalen · Personal Research Portfolio

Personal academic and research portfolio website for **Mehmet Arda Hakbilen (kael valen)**: trainscope (a loss-spike flight recorder), CERATA (transactional knowledge updates for frozen language models) and systems work.

Live: [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Design

The page is a drawing set. The hero is sheet 1 and each section is a further sheet with a title strip, numbered notes, figures, tables and a title block. The two themes are two real print media: light is a diazo whiteprint (blue-violet line on cool white stock), dark is a cyanotype (white line on Prussian blue). The accent is the reviewer's markup: red pencil on the whiteprint, yellow chalk on the cyanotype.

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, static export)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with semantic CSS-variable tokens (`--paper`, `--ink`, `--accent`, …) that swap per theme
- **Typography**: Archivo (variable, with its width axis separating condensed drawing lettering from expanded titles) and IBM Plex Mono for literal code, via `next/font/google`, with `latin-ext` for Turkish
- **Theming**: light / dark, resolved before first paint (saved choice → system preference), no flash
- **i18n**: English / Türkçe, all copy in `src/lib/dictionary.ts`; language is saved and defaults to the browser language
- **Accessibility**: every text/background pair meets WCAG AA (light `--muted` 4.9:1, `--accent` 5.6:1; dark `--muted` 5.7:1, `--accent` 8.5:1), skip link, tablist/radiogroup/combobox/`aria-pressed` semantics, `prefers-reduced-motion` support

---

## Key Components

- **`TensorName.tsx`** (Fig. 0, hero): the name sampled into a dot grid of keys; the pointer is the query and each dot's size is its softmax attention weight, computed every frame. Pauses off-screen; static under reduced motion.
- **`Navbar.tsx`**: the sheet's title strip, with scroll-spy, mobile menu, search, language and theme controls.
- **`ArchitectureDiagram.tsx`** (+ `diagram/`), Fig. 1:
  1. *Trainscope recorder* (`TrainscopePanel.tsx`): loss, kurtosis and CUSUM with early-warning lines and LR-surge simulation (data in `src/lib/trainscope-sim.ts`; telemetry is simulated).
  2. *CERATA* (`CerataPanel.tsx`): the three store operations (add, serve, remove) as step flows, following Algorithm 1 of the CERATA paper.
- **`CerataStore.tsx`** (Fig. 2): a toy store in the browser. Add and remove counterfactual facts, ask questions, see which entry answered and the state hash return to the empty store's. Hand-written relation keys stand in for the trained encoder.
- **`Research.tsx`**: prose, notes, references, and Table 1 (CounterFact paraphrase accuracy from the CERATA paper).
- **`Projects.tsx`**: a parts list with category filters; item numbers stay fixed when filtered.
- **`CommandPalette.tsx`**: keyboard-native launcher (`⌘K`, `Ctrl+K`, or `/`).
- **`Contact.tsx`**: mail link, copy-to-clipboard with live-region feedback, other addresses.

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
