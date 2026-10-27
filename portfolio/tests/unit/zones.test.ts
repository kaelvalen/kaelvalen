import { test } from "node:test";
import assert from "node:assert/strict";
import { formatZone, parseZone, rowsFor, zoneAt, zoneRect, type Layout } from "../../src/lib/zones.ts";

// Frame 800 px wide from x = 100; sheet 1 is 520 px tall (2 rows), sheet 2 is 1040 px (4 rows).
const layout: Layout = {
  left: 100,
  width: 800,
  sheets: [
    { n: 1, top: 0, height: 520, rows: rowsFor(520) },
    { n: 2, top: 520, height: 1040, rows: rowsFor(1040) },
  ],
};

test("rows are whole and never fewer than two", () => {
  assert.equal(rowsFor(100), 2);
  assert.equal(rowsFor(1040), 4);
});

test("a point maps to sheet, column and row", () => {
  assert.deepEqual(zoneAt(101, 1, layout), { sheet: 1, col: 0, row: 1 });
  assert.deepEqual(zoneAt(899, 519, layout), { sheet: 1, col: 7, row: 2 });
  assert.deepEqual(zoneAt(350, 520 + 300, layout), { sheet: 2, col: 2, row: 2 });
  assert.equal(zoneAt(50, 10, layout), null);
  assert.equal(zoneAt(150, 5000, layout), null);
});

test("references format and parse in every accepted spelling", () => {
  assert.equal(formatZone({ sheet: 2, col: 2, row: 4 }), "2·C4");
  for (const s of ["2·C4", "2-c4", "2 C4", "2C4", " 2.c4 "]) assert.deepEqual(parseZone(s, 1, layout), { sheet: 2, col: 2, row: 4 });
  assert.deepEqual(parseZone("b2", 1, layout), { sheet: 1, col: 1, row: 2 });
  assert.equal(parseZone("C9", 1, layout), null, "row outside the sheet");
  assert.equal(parseZone("J2", 1, layout), null, "column outside A–H");
  assert.equal(parseZone("relic", 1, layout), null);
});

test("a zone's rectangle contains the points that map to it", () => {
  const r = zoneRect({ sheet: 2, col: 5, row: 3 }, layout)!;
  assert.deepEqual(zoneAt(r.x + r.w / 2, r.y + r.h / 2, layout), { sheet: 2, col: 5, row: 3 });
});
