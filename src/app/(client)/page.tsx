import HeroSection from "@/components/sections/HeroSection";
import LayananSection from "@/components/sections/LayananSection";
import CabangSection from "@/components/sections/CabangSection";
import ProdukSection from "@/components/sections/ProdukSection";
import UnggulanSection from "@/components/sections/UnggulanSection";
import { getFeaturedProducts } from "@/utils/products";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  return (
    <main className="flex flex-col items-center justify-center w-full overflow-x-hidden">
      <HeroSection />
      <UnggulanSection featuredProducts={featuredProducts}/>
      <LayananSection />
      <CabangSection />
      <ProdukSection />
    </main>
  );
}
