import Image from "next/image";
import React from "react";
import Link from "next/link";

const ProdukSection = () => {
  return (
    <section className="pb-24 md:pb-12 relative">
      <Image
        src="/elements/paw-trail-blue.webp"
        alt="Hero Background"
        width={1920}
        height={1920}
        priority
        className="-z-50 absolute inset-0 m-auto transform scale-x-[-1] object-contain md:w-[50%] w-full"
      />
      
      <h2 className="text-3xl md:text-4xl font-boogaloo font-semibold text-center mb-16">
        Produk Muezza{" "}
      </h2>
      <div className="w-full flex justify-between flex-col-reverse md:flex-row px-12 gap-12">
        <div className="w-full md:w-1/2 flex flex-col gap-20 justify-center">
          <h3 className="text-2xl md:text-3xl font-boogaloo font-semibold text-center md:text-start">
            Produk di toko muezza
          </h3>
          <p className="text-lg">
            Kamu bisa menemukan berbagai kebutuhan kucing di sini. Muezza menyediakan makanan, vitamin, pasir, mainan, alat grooming, dan perlengkapan harian lain yang bisa kamu pilih sesuai kebutuhan kucingmu. 
            Setiap produk sudah dipilih dengan cermat agar aman dan nyaman dipakai. 
            Kamu bisa belanja tanpa bingung karena semua kategori tersedia dalam satu tempat.
          </p>
          <Link
            href="/produk"
            className="font-boogaloo text-xl px-16 py-3 rounded-full w-fit bg-primary-blue shadow-xl"
          >
            Selengkapnya
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-full">
          <Image
            src={"/landing/sections/produk-section/produk.webp"}
            alt={"Produk Muezza"}
            width={600}
            height={600}
            className="rounded-2xl object-contain w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default ProdukSection;
