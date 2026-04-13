import Nav from "./components/Nav";
import Hero from "./components/Hero";
import ConceptSection from "./components/ConceptSection";
import HowSection from "./components/HowSection";
import AudienceSection from "./components/AudienceSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <ConceptSection />
        <HowSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
