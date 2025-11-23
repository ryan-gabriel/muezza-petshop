import { GroomingClient } from "@/type/grooming";
import Image from "next/image";
import React from "react";

const formatPrice = (value: number) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toString();
};

const ServicesSection = ({ services }: { services: GroomingClient[] }) => {
  return (
    <section className="px-6 md:px-10 my-16">
      <h3 className="text-5xl text-center font-boogaloo mb-10">Layanan</h3>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 place-items-center">
        {services.map((service) => {
          const hasDiscount = service.discount?.is_active;
          const discountPercent = service.discount?.discount_percent ?? 0;
          const discountedPrice = Math.round(service.price * (1 - discountPercent / 100));

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

                {hasDiscount && (
                  <span className="absolute top-4 right-4 bg-primary-red bg-green-600 text-white px-3 py-1 text-sm rounded-lg shadow-md">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <h4 className="text-3xl mt-4 font-boogaloo mb-2">
                {service.name}
              </h4>

              <div className="flex flex-col items-center gap-1">
                {hasDiscount ? (
                  <>
                    <p className="text-muted-foreground line-through text-lg">
                      Rp {formatPrice(service.price)}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      Rp {formatPrice(discountedPrice)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    Rp {formatPrice(service.price)}
                  </p>
                )}
              </div>

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
