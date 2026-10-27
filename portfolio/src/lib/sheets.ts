/** The drawing set. Sheet 1 is the masthead at "/"; every other sheet has its own path. */
export const SHEET_IDS = ["top", "research", "projects", "toolbox", "contact"] as const;
export type SheetId = (typeof SHEET_IDS)[number];
export type SectionId = Exclude<SheetId, "top">;

export const SECTION_IDS = SHEET_IDS.slice(1) as SectionId[];
export const SHEETS = SHEET_IDS.length;

export const sheetNumber = (id: SheetId) => SHEET_IDS.indexOf(id) + 1;
export const sheetPath = (id: SheetId) => (id === "top" ? "/" : `/${id}`);

export function sheetFromPath(pathname: string): SheetId {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return (SHEET_IDS as readonly string[]).includes(slug) ? (slug as SheetId) : "top";
}
