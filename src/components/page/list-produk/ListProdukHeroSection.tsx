import Image from "next/image";
import React from "react";

const ListProdukHeroSection = () => {
  return (
    <section className="relative w-full mt-20 px-5 lg:px-10">
      <div className="relative w-full bg-[#B0D9F0] rounded-2xl overflow-hidden">
        {/* Background Dekoratif */}
        <Image
          src="/list-produk/hero-bg.webp"
          alt="Hero Cat"
          width={1000}
          height={1000}
          className="absolute lg:w-1/2 w-3/4 top-0 right-0 object-contain object-right-top"
        />

        {/* Content Wrapper */}
        <div className="relative flex flex-col lg:flex-row items-center gap-4 px-8 lg:px-20 lg:pr-0 pt-16 lg:pb-16">
          {/* Left Text */}
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="font-thin tracking-[0.14em]">MUEZZA PETSHOP</h4>
            <h3 className="font-boogaloo text-4xl md:text-5xl lg:text-6xl leading-tight mt-3">
              Belanja kebutuhan hewan anda dengan lengkap hanya di Muezza
              Petshop!
            </h3>
          </div>

          {/* Right Hero Cat */}
          <div className="lg:w-1/2 w-full h-full flex justify-center items-center">
            <div className="relative w-full aspect-video">
              <Image
                src="/list-produk/hero-cat.webp"
                alt="Hero Cat"
                fill
                priority
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListProdukHeroSection;
