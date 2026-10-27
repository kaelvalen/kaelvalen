// Serves the static export in out/ the way Vercel does: clean URLs (/research → research.html),
// 404.html for misses. Used by the end-to-end tests and the budget check; not for production.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = "out";
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [clean, `${clean}.html`, join(clean, "index.html")]) {
    const file = join(ROOT, candidate);
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* try the next form */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = await resolve(pathname);
  const status = file ? 200 : 404;
  const body = await readFile(file ?? join(ROOT, "404.html"));
  res.writeHead(status, { "content-type": TYPES[extname(file ?? ".html")] ?? "application/octet-stream" });
  res.end(body);
}).listen(PORT, () => console.log(`out/ on http://localhost:${PORT}`));
