import { getBranches } from "@/utils/branches";
import Image from "next/image";

const CabangSection = async () => {
  const branches = await getBranches();

  return (
    <section className="relative py-24 px-6 md:px-12 mb-28 md:mb-0 h-fit w-full">
      <Image
        src="/elements/paw-trail-blue.webp"
        alt="Hero Background"
        width={1920}
        height={1920}
        priority
        className="-z-50 absolute inset-0 m-auto object-contain md:w-[50%] w-full"
      />

      <h2 className="text-3xl md:text-4xl font-boogaloo font-semibold text-center mb-10">
        Cabang Muezza
      </h2>

      <div className="carousel-wrapper relative w-full h-auto">
        {/* Auto height element */}
        <div className="carousel-height opacity-0">
          {branches.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <Image
                  src={branches[0].image_url}
                  alt={branches[0].name}
                  width={600}
                  height={400}
                  className="rounded-2xl object-cover w-full aspect-square md:w-[90%]"
                />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-semibold font-boogaloo mb-3">
                  {branches[0].name}
                </h2>
                <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
                  {branches[0].description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Absolute slides */}
        {branches.map((cabang, index) => (
          <div
            key={cabang.id}
            className="carousel-slide absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{ animationDelay: `${index * 6}s` }}
          >
            {/* Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src={cabang.image_url}
                alt={cabang.name}
                width={600}
                height={400}
                className="rounded-2xl object-cover w-full aspect-square md:w-[90%]"
              />
            </div>

            {/* Text */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-semibold font-boogaloo mb-3">
                {cabang.name}
              </h2>

              <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
                {cabang.description}
              </p>

              <a
                href={`https://wa.me/${cabang.whatsapp_number}?text=Halo Muezza Petshop, Saya tertarik dengan produk dan layanan cabang ${cabang.name}. Bisakah anda membantu saya?`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition"
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CabangSection;
