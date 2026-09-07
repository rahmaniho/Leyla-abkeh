import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Services from "./components/Services";
import Benefits from "./components/Benefits";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import FloatingCall from "./components/FloatingCall";

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* لینک پرش برای کاربران صفحه‌خوان */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-ink-deep focus:shadow-gold"
      >
        پرش به محتوای اصلی
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Stats />
        <Features />
        <Services />
        <Benefits />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <FloatingCall />
    </div>
  );
}
