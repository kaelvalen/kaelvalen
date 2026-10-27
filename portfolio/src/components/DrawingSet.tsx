import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Masthead from "@/components/Masthead";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Toolbox from "@/components/Toolbox";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import SkipLink from "@/components/SkipLink";
import SheetFrame from "@/components/SheetFrame";
import SheetSpy from "@/components/SheetSpy";
import { getRevisions } from "@/lib/revisions";

/** The whole drawing set. Every sheet path renders it; the spy scrolls to the sheet in the address. */
export default function DrawingSet() {
  const revisions = getRevisions();
  const latest = revisions[0]?.letter ?? "";
  return (
    <>
      <SkipLink />
      <CommandPalette />
      <SheetSpy />
      <SheetFrame>
        <Navbar />
        <Masthead revision={revisions[0] ?? null} />
        {/* Each sheet hydrates behind its own boundary, so React can yield between sheets. */}
        <main id="main">
          <Suspense>
            <Research rev={latest} />
          </Suspense>
          <Suspense>
            <Projects />
          </Suspense>
          <Suspense>
            <Toolbox />
          </Suspense>
          <Suspense>
            <Contact />
          </Suspense>
        </main>
        <Suspense>
          <Footer revisions={revisions} />
        </Suspense>
      </SheetFrame>
    </>
  );
}
