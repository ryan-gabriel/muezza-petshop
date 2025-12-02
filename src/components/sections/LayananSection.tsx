import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LayananSection = () => {
  const layananMuezza = [
    {
      imageUrl: "/landing/sections/layanan-section/pet-shop.webp",
      title: "Pet Shop",
    },
    {
      imageUrl: "/landing/sections/layanan-section/pet-grooming.webp",
      title: "Pet Grooming",
    },
    {
      imageUrl: "/landing/sections/layanan-section/pet-hotel.webp",
      title: "Pet Hotel",
    },
    {
      imageUrl: "/landing/sections/layanan-section/pet-studio.webp",
      title: "Pet Studio",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden py-24">
      {/* Background paw trail */}
      <Image
        src="/elements/paw-trail-blue.webp"
        alt="Hero Background"
        width={1920}
        height={1920}
        priority
        className="absolute inset-0 m-auto transform scale-x-[-1] object-contain md:w-[50%] w-full -z-50"
      />

      {/* Section Title */}
      <h2 className="text-center font-boogaloo font-semibold text-3xl mb-12">
        Layanan Muezza
      </h2>

      {/* === Responsive Container === */}
      <div className="relative px-8 md:px-16">
        {/* Untuk layar besar → horizontal scroll
            Untuk layar kecil → grid (vertikal stack) */}
        <div
          className="
            flex md:flex-row flex-col items-center
            overflow-x-auto md:overflow-x-scroll
            overflow-y-visible md:overflow-y-visible
            scroll-smooth
            snap-x md:snap-none
            gap-6
            scrollbar-none
            w-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {layananMuezza.map((layanan, index) => (
            <div
              key={index}
              id={`layanan-${index}`}
              className="
                flex-shrink-0
                snap-center
                flex flex-col items-center
                w-[70%] md:w-[40vw] lg:w-[25vw] max-w-[400px]
              "
            >
              <div className="rounded-2xl overflow-hidden w-full">
                <Image
                  src={layanan.imageUrl}
                  alt={layanan.title}
                  width={800}
                  height={0}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-xl md:text-2xl tracking-wide font-semibold font-boogaloo text-center">
                {layanan.title}
              </p>
            </div>
          ))}
        </div>

        {/* Panah navigasi hanya muncul di layar besar */}
        <div className="hidden md:flex absolute inset-0 justify-between items-center px-4 md:px-8 pointer-events-none">
          <a
            href="#layanan-0"
            className="pointer-events-auto bg-white/90 shadow-md rounded-full p-2 md:p-3 hover:bg-gray-100 transition"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </a>
          <a
            href={`#layanan-${layananMuezza.length - 1}`}
            className="pointer-events-auto bg-white/90 shadow-md rounded-full p-2 md:p-3 hover:bg-gray-100 transition"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LayananSection;
