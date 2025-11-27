import Image from "next/image";
import React from "react";

const HotelHeroSection = () => {
  return (
    <section className="relative w-full pt-10">
      {/* Background image */}
      <Image
        src="/landing/sections/hero-section/hero-bg.webp"
        alt="Hero Background"
        width={1000}
        height={1000}
        priority
        className="absolute -right-0 sm:-right-44 md:-top-56 lg:-top-32 bottom-0 h-[125%] sm:h-[132.5%] lg:h-[120%] -z-10 object-cover sm:object-contain"
      />
      <div className="absolute bottom-0 md:bottom-20 lg:-bottom-12 right-0 w-[37.5%] sm:w-[32%] md:w-1/2 max-w-[600px] aspect-[1/1] -z-0">
        <Image
          src="/hotel/hero-image.webp"
          alt="Hero Cat"
          fill
          priority
          className=" object-contain object-bottom-right md:object-top-right lg:object-right transition-all duration-300"
          sizes="(max-width: 600px) 75vw, 35vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start px-6 md:px-12 py-20 md:py-32">
        {/* Left content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="font-boogaloo text-5xl md:text-8xl leading-tight drop-shadow-lg">
            Pet Hotel
          </h1>
          <p className="text-base md:text-lg text-justify mt-6 mb-10">
            Kamu bisa titip hewanmu tanpa rasa cemas. Kami siapkan ruang yang nyaman, bersih, dan terpantau. Setiap hewan kami beri jadwal makan teratur, sesi bermain harian, serta perhatian dari pet keeper yang ramah. Kamu bisa fokus pada perjalananmu sementara hewanmu menikmati pengalaman yang aman dan tenang.
          </p>
          <button className="shadow-lg hover:shadow-2xl transition-all duration-200 px-8 md:px-10 py-3 rounded-full font-boogaloo border-[0.2px] border-blue-300 bg-white md:bg-primary-blue text-black hover:bg-white/80 cursor-pointer md:hover:bg-primary-blue/80">
            Booking Sekarang
          </button>
        </div>
      </div>
    </section>
  );
};

export default HotelHeroSection;