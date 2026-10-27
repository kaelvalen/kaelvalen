import type { Metadata } from "next";
import DrawingSet from "@/components/DrawingSet";
import { SECTION_IDS, sheetNumber, type SectionId } from "@/lib/sheets";
import { en } from "@/lib/dictionary";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_IDS.map((sheet) => ({ sheet }));
}

const blurb: Record<SectionId, string> = {
  research: en.research.heading,
  projects: en.projects.heading,
  toolbox: en.toolbox.heading,
  contact: en.contact.heading,
};

export async function generateMetadata({ params }: { params: Promise<{ sheet: SectionId }> }): Promise<Metadata> {
  const { sheet } = await params;
  const title = `${en.nav[sheet]}, sheet ${sheetNumber(sheet)}`;
  return {
    title,
    description: blurb[sheet],
    alternates: { canonical: `/${sheet}` },
    openGraph: { title, description: blurb[sheet], url: `/${sheet}` },
  };
}

/** Every sheet is the same document; the address says which sheet to open it at. */
export default function Sheet() {
  return <DrawingSet />;
}
