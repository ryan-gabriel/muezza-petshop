import Image from "next/image";
import React from "react";

const Galleries = () => {
  return (
    <section className="my-10">
      <h3 className="font-boogaloo text-5xl text-center font-semibold mb-10">
        Galeri Muezza
      </h3>

      <div
        className="
          grid gap-6
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-2 lg:grid-rows-4
        "
      >
        {/* item 1 */}
        <div>
          <Image
            src="/studios/galleries/image1.webp"
            alt="gallery 1"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* item 2 */}
        <div>
          <Image
            src="/studios/galleries/image2.webp"
            alt="gallery 2"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* item 3 – tall image (only tall on desktop) */}
        <div className="lg:row-span-2">
          <Image
            src="/studios/galleries/image3.webp"
            alt="gallery 3"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* item 4 */}
        <div>
          <Image
            src="/studios/galleries/image4.webp"
            alt="gallery 4"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* item 5 */}
        <div>
          <Image
            src="/studios/galleries/image1.webp"
            alt="gallery 5"
            width={600}
            height={600}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* item 6 – wide image (only wide on desktop) */}
        <div className="lg:col-span-2">
          <Image
            src="/studios/galleries/image5.webp"
            alt="gallery 6"
            width={600}
            height={600}
            className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Galleries;
