import type { Metadata } from "next";
import Site from "@/components/Site";
import { SECTION_IDS, type SectionId } from "@/lib/sheets";
import { en } from "@/lib/dictionary";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_IDS.map((sheet) => ({ sheet }));
}

const blurb: Record<SectionId, string> = {
  research: en.research.heading,
  projects: en.projects.heading,
  contact: en.contact.heading,
};

export async function generateMetadata({ params }: { params: Promise<{ sheet: SectionId }> }): Promise<Metadata> {
  const { sheet } = await params;
  const title = en.nav[sheet];
  return {
    title,
    description: blurb[sheet],
    alternates: { canonical: `/${sheet}` },
    openGraph: { title, description: blurb[sheet], url: `/${sheet}` },
  };
}

/** Every section is the same document; the address says which section to open it at. */
export default function Sheet() {
  return <Site />;
}
