import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import LayananSection from "@/components/sections/LayananSection";
import CabangSection from "@/components/sections/CabangSection";
import ProdukSection from "@/components/sections/ProdukSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center w-full overflow-x-hidden">
        <HeroSection />
        <LayananSection />
        <CabangSection />
        <ProdukSection />
      </main>
      <Footer />
    </>
  );
}
