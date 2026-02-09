import { GroomingClient } from "@/type/grooming";
import Image from "next/image";
import React from "react";

const ServicesSection = ({ services }: { services: GroomingClient[] }) => {
  return (
    <section className="px-6 md:px-10 my-16">
      <h3 className="text-5xl text-center font-boogaloo mb-10">Layanan</h3>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 place-items-center">
        {services.map((service) => {
          return (
            <div
              key={service.id}
              className="flex flex-col items-center text-center w-full max-w-[450px]"
            >
              <div className="relative w-full flex justify-center p-10 items-center">
                <Image
                  src="/groomings/service-bg.webp"
                  alt="service background"
                  width={1920}
                  height={1920}
                  className="absolute -z-10 inset-0 object-contain w-full aspect-square"
                />
                <Image
                  src={service.image_url}
                  alt={service.name}
                  width={1920}
                  height={1920}
                  className="w-full aspect-square object-contain"
                />
              </div>

              <h4 className="text-3xl mt-4 font-boogaloo mb-2">
                {service.name}
              </h4>

              <p className="text-muted-foreground text-center w-[80%] mt-3">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;
