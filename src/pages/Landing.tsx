import Nav from "../components/Nav/Nav";
import Hero from "../components/Hero/Hero";
import ConceptSection from "../components/ConceptSection/ConceptSection";
import HowSection from "../components/HowSection/HowSection";
import AudienceSection from "../components/AudienceSection/AudienceSection";
import CTASection from "../components/CTASection/CTASection";
import Footer from "../components/Footer/Footer";

export default function Landing() {
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
