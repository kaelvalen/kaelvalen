# kaelvalen · Personal Research Portfolio

Personal academic and research portfolio website for **Mehmet Arda Hakbilen (kael valen)**: trainscope (a loss-spike flight recorder), RELIC (transactional knowledge updates for frozen language models) and systems work.

Live: [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Design

The page is a loss surface, seen at night or by day.

- **The map.** The hero is a contour map of a loss surface (`src/lib/landscape.ts`): a wide bowl with one Gaussian basin per project. RELIC is the deepest; NOESIS, the closed negative result, is a ridge with no basin under it. Where the basins sit and how deep they go is a composition, not a measurement, and the page says so. The contours are traced with marching squares in the browser on every resize; every fifth line is heavier and carries its value, and each place has a spot height, as on a survey sheet. A legend says what is real: the depths are made up, the descent is not.
- **A ball you can drop.** Click anywhere on the map (or use "Drop a ball at random") and a ball runs gradient descent with momentum down the same surface, then reports the basin it settled in and how many steps it took. Under reduced motion it lands at once.
- **The sky over Ankara.** Left alone, the page shows the sky Ankara has right now: the sun's position is computed before first paint (NOAA's simplified solar position, inlined in `layout.tsx`), so after sunset the page opens as a violet night with stars and a pink accent, and by day as a pale survey sheet. The moon in the corner is tonight's phase. The reader can switch the sky by hand; switching back to Ankara's own sky hands the page back to it. The switch sweeps across like a terminator line (view transition).
- **The basins below.** Every project on the map has a row, and beside it a slice through its basin, taken from the same surface.
- **Type.** Spectral for names, italic for places on the map as on a survey sheet; IBM Plex Sans for reading, IBM Plex Mono for heights and literal code.

## Figures that compute

- **The map** (`components/Hero.tsx`): contours, descent and sky from `lib/landscape.ts`, all unit-tested (`tests/unit/landscape.test.ts`): contour points lie on their level, a ball dropped near any basin settles in it, nothing settles on the ridge, the sun is up and down at the right hours in Ankara, the moon is full and new on the right dates.
- **Fig. 1, flight recorder** (`diagram/FlightRecorder.tsx`, `src/workers/recorder.ts`): a simulated training run streams into a real one-sided CUSUM detector (`src/lib/cusum.ts`) in a Web Worker. Raise the learning rate and watch the alarm land before the spike. The run is simulated; the detector is not, and its claims are unit-tested: no false alarm in 300 nominal runs, an alarm before the spike at every surge from 1.3× to 5×.
- **Fig. 1, RELIC** (`diagram/RelicPanel.tsx`): the three store operations as plotted flows, following Algorithm 1 of the paper.
- **Fig. 2, a store you can edit** (`RelicStore.tsx`): add and remove counterfactual facts, see which entry answered and the state hash return to the empty store's. Optionally load a general-purpose sentence encoder (all-MiniLM-L6-v2 via transformers.js, about 23 MB, fetched only on request) and ask free questions, routed by cosine against the entry's relation keys at the paper's τ = 0.75.

## Engineering

- **Stack**: Next.js 16 (App Router, Turbopack, static export), React 19, Tailwind CSS 4. No runtime UI, motion or graphics libraries: canvas 2D, WAAPI, scroll-driven CSS and View Transitions.
- **Addresses**: one page, four paths (`/`, `/projects`, `/research`, `/contact`). Scrolling rewrites the address to the section in view; a section link moves with a view transition instead of scrolling through everything in between.
- **Workers** are bundled ahead of Next by `scripts/build-workers.mjs` (esbuild) into `public/workers/`, because Turbopack 16.1 copies `new Worker(new URL(...))` targets as raw assets in production builds.
- **i18n**: English by default, Türkçe on request (saved); all copy in `src/lib/dictionary.ts`.
- **Accessibility**: WCAG 2.2 AA checked by axe under both skies on every build; every text colour meets AA on both backgrounds. The map's labels are real text, and the ball's result is announced.
- **Quality gates** (`.github/workflows/portfolio.yml`): lint, types, unit tests (`node --test`), build, a size budget per page (`scripts/budget.mjs`: 230 kB JS, 12 kB CSS gzipped), Playwright behaviour, axe and pixel tests in the Playwright container (sky and clock pinned, canvases hidden), and Lighthouse CI (desktop: performance ≥ 0.9, accessibility, best practices and SEO = 1).
- **Link card**: `public/og.png` is a screenshot of the night hero at 1200 × 630 with the moon and buttons hidden; retake it when the hero changes.

## Running

```bash
npm install
npm run dev            # builds workers, then next dev
npm test               # unit tests: detector, landscape and sky
npm run build          # workers + static export to out/
npm run budget         # size budget on out/
npm run test:e2e       # Playwright against out/ (CHROME_PATH=… to use a system Chrome)
npm run test:visual:update   # pixel baselines, made inside the CI image (needs Docker)
```
