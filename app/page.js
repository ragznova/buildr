import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Waitlist from "@/components/landing/Waitlist";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />

      <Hero />
      
      <div id="how-it-works">
        <HowItWorks />
      </div>

      <div id="features">
        <Features />
      </div>

      <div id="pricing">
        <Pricing />
      </div>

      <div id="faq">
        <FAQ />
      </div>

      <div id="waitlist">
        <Waitlist />
      </div>

      <Footer />
    </main>
  );
}
