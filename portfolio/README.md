# kaelvalen · Personal Research Portfolio

Personal academic and research portfolio website for **Mehmet Arda Hakbilen (kael valen)**: trainscope (a loss-spike flight recorder), CERATA (transactional knowledge updates for frozen language models) and systems work.

Live: [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Design

The page is a drawing set, and the drawing conventions do real work rather than decorate it.

- **Sheets with addresses.** Five sheets on one document, each with its own path (`/`, `/research`, `/projects`, `/toolbox`, `/contact`). Scrolling rewrites the address to the sheet in view; a sheet link turns the sheet with a view transition instead of scrolling through everything between.
- **Zones.** Columns A–H run across the frame and every sheet is divided into numbered rows down both margins, so any point has a reference such as `2·C4`. The cursor shows its zone, figure captions and notes cite figures by zone (live, so they stay right at any width), and the command palette takes a zone and sends you there.
- **Dimension lines** over text report the block's real measure in pixels and in characters of its own font.
- **Revision block** compiled from this directory's git history at build time; content changed in the latest revision is marked with a revision cloud and its letter.
- **Two print media.** Light is a diazo whiteprint (blue-violet line on cool white stock), dark is a cyanotype (white line on Prussian blue). The paper fibre is generated on the GPU once per medium as a seamless tile. Switching media is an exposure: a UV lamp sweeps the sheet and the new medium develops ahead of the reveal edge (view transition + WebGL).
- **One motion model, a pen plotter.** Figures are plotted in drawing order (pen down, draw, lift, dotted travel move), sheet rules are ruled in as the sheet scrolls in (scroll-driven CSS), and every duration and curve comes from motion tokens. Reduced motion shows the finished drawing.
- **Type on the paper ratio.** One family, Archivo, whose width axis separates condensed drawing lettering from expanded titles, set on a √2 scale (ISO 216): A steps are successive sheet sizes, B steps the geometric means between them.
- **Print** produces the drawing set itself: one sheet per A3 landscape page, each closed by its own title block, always as a whiteprint.

## Figures that compute

- **Fig. 0** (`TensorName.tsx`): the name sampled into ~13,000 keys; the pointer is a query read by two attention heads with different projections and temperatures. Each dot's softmax weight and size are computed on the GPU (WebGL2 instanced points); the CPU only finds each head's maximum and normaliser for the readouts. Canvas 2D fallback.
- **Fig. 1, flight recorder** (`diagram/FlightRecorder.tsx`, `src/workers/recorder.ts`): a simulated training run streams into a real one-sided CUSUM detector (`src/lib/cusum.ts`) in a Web Worker. Raise the learning rate and watch the alarm land before the spike. The run is simulated; the detector is not, and its claims are unit-tested: no false alarm in 300 nominal runs, an alarm before the spike at every surge from 1.3× to 5×.
- **Fig. 1, CERATA** (`diagram/CerataPanel.tsx`): the three store operations as plotted flows, following Algorithm 1 of the paper.
- **Fig. 2, a store you can edit** (`CerataStore.tsx`): add and remove counterfactual facts, see which entry answered and the state hash return to the empty store's. Optionally load a general-purpose sentence encoder (all-MiniLM-L6-v2 via transformers.js, about 23 MB, fetched only on request) and ask free questions, routed by cosine against the entry's relation keys at the paper's τ = 0.75.

## Engineering

- **Stack**: Next.js 16 (App Router, Turbopack, static export), React 19, Tailwind CSS 4. No runtime UI, motion or 3D libraries: WAAPI, scroll-driven CSS, View Transitions and raw WebGL.
- **Workers** are bundled ahead of Next by `scripts/build-workers.mjs` (esbuild) into `public/workers/`, because Turbopack 16.1 copies `new Worker(new URL(...))` targets as raw assets in production builds.
- **i18n**: English by default, Türkçe on request (saved); all copy in `src/lib/dictionary.ts`.
- **Accessibility**: WCAG 2.2 AA checked by axe in both media on every build; every text/background pair meets AA against the flat paper colour (the fibre tile is kept under it).
- **Quality gates** (`.github/workflows/portfolio.yml`): lint, types, unit tests (`node --test`), build, a size budget per sheet (`scripts/budget.mjs`: 230 kB JS, 12 kB CSS gzipped), Playwright behaviour, axe and pixel tests in the Playwright container, and Lighthouse CI (desktop: performance ≥ 0.9, accessibility, best practices and SEO = 1).

## Running

```bash
npm install
npm run dev            # builds workers, then next dev
npm test               # unit tests: detector, zones
npm run build          # workers + static export to out/
npm run budget         # size budget on out/
npm run test:e2e       # Playwright against out/ (CHROME_PATH=… to use a system Chrome)
npm run test:visual:update   # pixel baselines, made inside the CI image (needs Docker)
```
