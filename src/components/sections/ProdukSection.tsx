import Image from "next/image";
import React from "react";

const ProdukSection = () => {
  return (
    <section className="pb-24 md:pb-12 relative">
      <Image
        src="/elements/paw-trail-blue.webp"
        alt="Hero Background"
        width={1920}
        height={1920}
        priority
        className="absolute inset-0 m-auto transform scale-x-[-1] object-contain md:w-[50%] w-full"
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
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus
            doloribus, adipisci voluptatum mollitia laboriosam vero nisi
            suscipit voluptates, sint vel saepe eos nostrum culpa numquam.
            Repellendus inventore ipsam nemo sed? Lorem, ipsum dolor sit amet
            consectetur adipisicing elit. Aperiam, corrupti molestias officiis
            ab repellendus exercitationem quis amet. Quae, nihil consequuntur?
            Architecto quis inventore nulla debitis ad facere eligendi,
            molestiae quo.
          </p>
          <button className="font-boogaloo text-xl px-16 py-3 rounded-full w-fit bg-primary-blue shadow-xl">
            Selengkapnya
          </button>
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
