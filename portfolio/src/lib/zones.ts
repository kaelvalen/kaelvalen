/**
 * Zone references, as on a drawing border: columns A–H run across the frame, rows run down each
 * sheet, and a reference names sheet, column and row ("2·C4"). The frame publishes its layout here;
 * anything that cites a zone (figure captions, the command palette, the cursor readout) reads it.
 */

export const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
/** Target row height; each sheet is divided into a whole number of rows close to this. */
export const ROW_PX = 260;

export type SheetBand = { n: number; top: number; height: number; rows: number };
export type Layout = { left: number; width: number; sheets: SheetBand[] };
export type Zone = { sheet: number; col: number; row: number };

let layout: Layout = { left: 0, width: 0, sheets: [] };
const listeners = new Set<() => void>();

export const getLayout = () => layout;

export function setLayout(next: Layout) {
  layout = next;
  listeners.forEach((l) => l());
}

export function subscribeLayout(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const rowsFor = (height: number) => Math.max(2, Math.round(height / ROW_PX));

export const formatZone = (z: Zone) => `${z.sheet}·${COLUMNS[z.col]}${z.row}`;

/** The zone under a point in page coordinates, or null outside the frame. */
export function zoneAt(x: number, y: number, l: Layout = layout): Zone | null {
  if (!l.width || x < l.left || x > l.left + l.width) return null;
  const band = l.sheets.find((s) => y >= s.top && y < s.top + s.height);
  if (!band) return null;
  const col = Math.min(COLUMNS.length - 1, Math.floor(((x - l.left) / l.width) * COLUMNS.length));
  const row = Math.min(band.rows, 1 + Math.floor(((y - band.top) / band.height) * band.rows));
  return { sheet: band.n, col, row };
}

/** The zone an element is cited by: the centre of its first screenful. */
export function zoneOfElement(el: Element, l: Layout = layout): Zone | null {
  const r = el.getBoundingClientRect();
  const x = r.left + window.scrollX + r.width / 2;
  const y = r.top + window.scrollY + Math.min(r.height, window.innerHeight * 0.6) / 2;
  return zoneAt(x, y, l);
}

/** Page rectangle of a zone. */
export function zoneRect(z: Zone, l: Layout = layout) {
  const band = l.sheets.find((s) => s.n === z.sheet);
  if (!band || z.row < 1 || z.row > band.rows) return null;
  const w = l.width / COLUMNS.length;
  const h = band.height / band.rows;
  return { x: l.left + z.col * w, y: band.top + (z.row - 1) * h, w, h };
}

/**
 * Parses "3·C4", "3-C4", "3 c4", "3C4" or "C4". Without a sheet number the reference is read on
 * `currentSheet`. Returns null for anything that is not a zone on the current layout.
 */
export function parseZone(input: string, currentSheet: number, l: Layout = layout): Zone | null {
  const m = input.trim().match(/^(?:(\d{1,2})\s*[-·.\s/]?\s*)?([a-h])\s*(\d{1,2})$/i);
  if (!m) return null;
  const z = { sheet: m[1] ? Number(m[1]) : currentSheet, col: COLUMNS.indexOf(m[2].toUpperCase() as (typeof COLUMNS)[number]), row: Number(m[3]) };
  return zoneRect(z, l) ? z : null;
}

/** Event the palette fires to send the reader to a zone; the frame scrolls there and marks it. */
export const GOTO_ZONE = "goto-zone";
export type GotoZoneDetail = Zone;
