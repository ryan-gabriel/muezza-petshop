import { AddonServiceClient } from "@/type/addonService";
import React from "react";

const formatPrice = (value: number) => {
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "K";
  return value.toString();
};

const AddonSection = ({ services }: { services: AddonServiceClient[] }) => {
  return (
    <section className="px-6 md:px-10 my-24">
      <h3 className="text-5xl font-boogaloo text-center mb-12">
        Add On Services:
      </h3>

      <div className="flex flex-wrap gap-8 justify-evenly">
        {services.map((service) => {
          const hasDiscount = service.discount && service.discount.is_active;
          const discountPercent = hasDiscount
            ? service.discount!.discount_percent
            : 0;
          const discountedPrice = hasDiscount
            ? Math.round(service.price * (1 - discountPercent / 100))
            : service.price;

          return (
            <div
              key={service.id}
              className="p-4 flex relative flex-col items-center border-2 border-gray-300 rounded-xl max-w-[300px] w-full shadow-sm"
            >
              {/* Nama + Harga */}
              <div className="w-full flex justify-between gap-10 items-center">
                <h4 className="text-2xl w-[60%] font-semibold">
                  {service.name}
                </h4>

                {hasDiscount ? (
                  <div className="flex flex-col items-center mt-2">
                    <p className="text-muted-foreground line-through text-lg">
                      Rp {formatPrice(service.price)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-green-600 font-bold text-xl">
                        Rp {formatPrice(discountedPrice)}
                      </p>
                      <span className="absolute -top-4 -right-4 bg-primary-red bg-green-600 text-white px-3 py-1 text-sm rounded-lg shadow-md">
                        -{discountPercent}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl font-semibold mt-2 w-[40%] text-end">
                    Rp {formatPrice(service.price)}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <p className="text-muted-foreground mt-6 text-justify px-4">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AddonSection;
