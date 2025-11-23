import { PhotoshootPackageClient } from "@/type/photoshoot";
import Image from "next/image";
import React from "react";

const PackageSection = ({
  packages,
}: {
  packages: PhotoshootPackageClient[];
}) => {
  return (
    <section className="my-10">
      <h3 className="font-boogaloo text-5xl text-center mb-6">
        Paket Photoshoot
      </h3>

      <div className="flex flex-col gap-16 px-6 md:px-16">
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`
              flex flex-col gap-6
              md:gap-8 md:items-center
              ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"}
            `}
          >
            {/* IMAGE — always on top for mobile */}
            <div className="w-full">
              <Image
                src={pkg.image_url ?? "/placeholder-image.jpg"}
                width={1920}
                height={1080}
                alt={pkg.name}
                className="w-full h-64 md:h-full object-cover rounded-lg"
              />
            </div>

            {/* TEXT */}
            <div className="w-full">
              <h4 className="text-3xl font-boogaloo">{pkg.name}</h4>
              <ul className="text-lg">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="list-disc ml-6 mt-2">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PackageSection;
