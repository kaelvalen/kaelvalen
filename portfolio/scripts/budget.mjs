// Size budget for the first load of every sheet: the gzipped JS and CSS each page's HTML asks for,
// plus the recorder's worker. Fails (exit 1) when any page is over. Run after `npm run build`.
import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const BUDGET = { js: 230_000, css: 12_000, worker: 4_000 };
const ROOT = "out";

const gz = async (path) => gzipSync(await readFile(`${ROOT}${path}`), { level: 9 }).length;
const kb = (n) => `${(n / 1000).toFixed(1)} kB`;

const pages = (await readdir(ROOT)).filter((f) => f.endsWith(".html") && !f.startsWith("_") && f !== "404.html");
let failed = false;

for (const page of pages) {
  const html = await readFile(`${ROOT}/${page}`, "utf8");
  const js = [...new Set([...html.matchAll(/src="(\/_next\/[^"]+\.js)"/g)].map((m) => m[1]))];
  const css = [...new Set([...html.matchAll(/href="(\/_next\/[^"]+\.css)"/g)].map((m) => m[1]))];
  const size = {
    js: (await Promise.all(js.map(gz))).reduce((a, b) => a + b, 0),
    css: (await Promise.all(css.map(gz))).reduce((a, b) => a + b, 0),
  };
  const over = Object.entries(size).filter(([k, v]) => v > BUDGET[k]);
  failed ||= over.length > 0;
  console.log(`${over.length ? "✗" : "✓"} ${page.padEnd(16)} js ${kb(size.js)} / ${kb(BUDGET.js)}   css ${kb(size.css)} / ${kb(BUDGET.css)}`);
}

const worker = await gz("/workers/recorder.js");
failed ||= worker > BUDGET.worker;
console.log(`${worker > BUDGET.worker ? "✗" : "✓"} recorder worker  ${kb(worker)} / ${kb(BUDGET.worker)}`);

process.exit(failed ? 1 : 0);
