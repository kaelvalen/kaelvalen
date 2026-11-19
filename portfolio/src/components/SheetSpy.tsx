"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { startSheetSpy } from "@/lib/nav";
import { SHEET_IDS, type SheetId } from "@/lib/sheets";

/** Keeps the address and the document title on the sheet in view. Renders nothing. */
export default function SheetSpy() {
  const { t } = useI18n();
  const { alias, name, role } = t.hero;
  const nav = t.nav;

  useEffect(() => {
    const titles = Object.fromEntries(
      SHEET_IDS.map((id) => [id, id === "top" ? `${alias} · ${name}, ${role}` : `${nav[id]} · ${alias}`])
    ) as Record<SheetId, string>;
    return startSheetSpy(titles);
  }, [alias, name, nav, role]);

  return null;
}
