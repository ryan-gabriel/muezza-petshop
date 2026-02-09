import { AddonServiceClient } from "@/type/addonService";
import React from "react";

const AddonSection = ({ services }: { services: AddonServiceClient[] }) => {
  return (
    <section className="px-6 md:px-10 my-24">
      <h3 className="text-5xl font-boogaloo text-center mb-12">
        Add On Services:
      </h3>

      <div className="flex flex-wrap gap-8 justify-evenly">
        {services.map((service) => {
          return (
            <div
              key={service.id}
              className="p-4 flex relative flex-col items-center border-2 border-gray-300 rounded-xl max-w-[300px] w-full shadow-sm"
            >
              {/* Nama */}
              <div className="w-full flex justify-center items-center">
                <h4 className="text-2xl font-semibold text-center">
                  {service.name}
                </h4>
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
