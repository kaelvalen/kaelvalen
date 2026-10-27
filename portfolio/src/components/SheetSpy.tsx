"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { startSheetSpy } from "@/lib/nav";
import { SHEET_IDS, type SheetId } from "@/lib/sheets";

/** Keeps the address and the document title on the sheet in view. Renders nothing. */
export default function SheetSpy() {
  const { t } = useI18n();
  const name = t.hero.name;
  const nav = t.nav;

  useEffect(() => {
    const titles = Object.fromEntries(
      SHEET_IDS.map((id) => [id, id === "top" ? `${name} · ${t.hero.role}` : `${nav[id]} · ${name}`])
    ) as Record<SheetId, string>;
    return startSheetSpy(titles);
  }, [name, nav, t.hero.role]);

  return null;
}
