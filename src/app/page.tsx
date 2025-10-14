import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import LayananSection from "@/components/sections/LayananSection";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LayananSection />
      </main>
    </>
  );
}
