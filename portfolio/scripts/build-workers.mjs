// Bundles each module in src/workers/ into public/workers/<name>.js.
//
// Turbopack (Next 16.1) copies a `new Worker(new URL("./x.ts", import.meta.url))` target as a raw
// asset in production builds instead of bundling it, so workers are built here, ahead of Next, and
// loaded by path. Run with --watch during development.
import { readdirSync } from "node:fs";
import { basename } from "node:path";
import { build, context } from "esbuild";

const entryPoints = Object.fromEntries(
  readdirSync("src/workers")
    .filter((f) => f.endsWith(".ts"))
    .map((f) => [basename(f, ".ts"), `src/workers/${f}`])
);

const options = {
  entryPoints,
  outdir: "public/workers",
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  sourcemap: false,
  logLevel: "info",
};

if (process.argv.includes("--watch")) await (await context(options)).watch();
else await build(options);
