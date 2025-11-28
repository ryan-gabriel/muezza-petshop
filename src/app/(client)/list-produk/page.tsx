import ListProdukHeroSection from "@/components/page/list-produk/ListProdukHeroSection";
import ListProdukSection from "@/components/page/list-produk/ListProdukSection";
import LogoProdukSection from "@/components/page/list-produk/LogoProdukSection";
import TestimoniSection from "@/components/page/list-produk/TestimoniSection";
import Navbar from "@/components/ui/Navbar";
import React from "react";

const page = ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) => {
  return (
    <>
      <Navbar useBackground={true} />
      <main className="overflow-x-hidden">
        <ListProdukHeroSection />
        <LogoProdukSection />
        <ListProdukSection searchParams={searchParams} />
        <TestimoniSection />
      </main>
      ;
    </>
  );
};

export default page;
