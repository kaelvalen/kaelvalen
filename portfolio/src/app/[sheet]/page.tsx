import type { Metadata } from "next";
import Site from "@/components/Site";
import { SECTION_IDS, type SectionId } from "@/lib/sheets";
import { en } from "@/lib/dictionary";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_IDS.map((sheet) => ({ sheet }));
}

const blurb: Record<SectionId, string> = {
  research: en.research.heading,
  projects: "RELIC, Weightsmith, latch-lang, measure, connor and systems work by Mehmet Arda Hakbilen (kael valen).",
  contact: "Contact Mehmet Arda Hakbilen (kael valen) via email, GitHub, LinkedIn, PyPI or crates.io.",
};

export async function generateMetadata({ params }: { params: Promise<{ sheet: SectionId }> }): Promise<Metadata> {
  const { sheet } = await params;
  const title = en.nav[sheet];
  const fullTitle = `${title} · kael valen`;
  return {
    title,
    description: blurb[sheet],
    alternates: { canonical: `/${sheet}` },
    openGraph: {
      ...OG_BASE,
      title: fullTitle,
      description: blurb[sheet],
      url: `/${sheet}`,
    },
    twitter: {
      ...TWITTER_BASE,
      title: fullTitle,
      description: blurb[sheet],
    },
  };
}

/** Every section is the same document; the address says which section to open it at. */
export default function Sheet() {
  return <Site />;
}
