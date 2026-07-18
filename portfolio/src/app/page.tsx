import Masthead from "@/components/Masthead";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Toolbox from "@/components/Toolbox";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <Research />
        <Projects />
        <Toolbox />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
