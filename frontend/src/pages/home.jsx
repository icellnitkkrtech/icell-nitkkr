import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/layout/HeroSection";
import EventSection from "../components/layout/EventSection";
import TeamSection from "../components/layout/TeamSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden">

      <div className="fixed top-3 sm:top-4 md:top-6 w-full z-50 flex justify-center px-3 sm:px-4">
        <Navbar />
      </div>

      <main className="flex-1">
        <HeroSection />

        {/* Subtle section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

        <EventSection />

        {/* Subtle section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

        <TeamSection />
      </main>

      <Footer />
    </div>
  );
}
