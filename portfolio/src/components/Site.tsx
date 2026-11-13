import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import SkipLink from "@/components/SkipLink";
import SheetSpy from "@/components/SheetSpy";

/** The whole site on one page. Every section path renders it; the spy scrolls to the section in the address. */
export default function Site() {
  return (
    <>
      <SkipLink />
      <CommandPalette />
      <SheetSpy />
      <Navbar />
      <Hero />
      {/* Each section hydrates behind its own boundary, so React can yield between them. */}
      <main id="main">
        <Suspense>
          <Projects />
        </Suspense>
        <Suspense>
          <Research />
        </Suspense>
        <Suspense>
          <Contact />
        </Suspense>
      </main>
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
