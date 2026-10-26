import Navbar from "@/components/Navbar";
import Masthead from "@/components/Masthead";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Toolbox from "@/components/Toolbox";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import SkipLink from "@/components/SkipLink";

const ZONES = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Zone letters in the sheet margin, as on a drawing border. Desktop only. */
function ZoneRuler() {
  return (
    <div aria-hidden className="hidden h-5 grid-cols-8 text-[10px] text-muted sm:grid">
      {ZONES.map((z, i) => (
        <span key={z} className={`flex items-center justify-center ${i ? "border-l border-line-strong" : ""}`}>
          {z}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SkipLink />
      <CommandPalette />
      <div className="sm:p-3">
        <div className="sm:border-[1.5px] sm:border-ink sm:px-5">
          <ZoneRuler />
          <div className="sm:border sm:border-ink">
            <Navbar />
            <Masthead />
            <main id="main">
              <Research />
              <Projects />
              <Toolbox />
              <Contact />
            </main>
            <Footer />
          </div>
          <ZoneRuler />
        </div>
      </div>
    </>
  );
}
