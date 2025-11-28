import Image from "next/image";
import React from "react";

const LogoProdukSection = () => {
  return (
    <section className="w-full my-10 place-items-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 p-4">
      <Image
        width={2000}
        height={500}
        src="/list-produk/Royal Canin.webp"
        alt="Logo Royal Canin"
        className="w-full h-auto object-contain"
      />
      <Image
        width={2000}
        height={500}
        src="/list-produk/Whiskas.webp"
        alt="Logo Whiskas"
        className="w-full h-auto object-contain"
      />
      <Image
        width={2000}
        height={500}
        src="/list-produk/Me-O.webp"
        alt="Logo Me-O"
        className="w-full h-auto object-contain"
      />
      <Image
        width={2000}
        height={500}
        src="/list-produk/Bolt.webp"
        alt="Logo Bolt"
        className="w-full h-auto object-contain"
      />
    </section>
  );
};

export default LogoProdukSection;
