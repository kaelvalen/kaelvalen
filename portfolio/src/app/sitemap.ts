import type { MetadataRoute } from "next";
import { SHEET_IDS, sheetPath } from "@/lib/sheets";

export const dynamic = "force-static";

const SITE = "https://kaelvalen.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return SHEET_IDS.map((id) => ({ url: `${SITE}${sheetPath(id)}`, changeFrequency: "monthly", priority: id === "top" ? 1 : 0.7 }));
}
