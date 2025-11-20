import Image from "next/image";

const CabangSection = () => {
  const listCabang = [
    {
      title: "Muezza Petshop Margahayu Raya",
      description:
        "Lorem ipsum dolor sit amet consectetur. Mi libero nunc duis accumsan massa vitae tempus aenean in. Pharetra turpis lacus congue egestas in. Tincidunt eget id ac tellus. Tempus vitae eget nisi quis suspendisse egestas adipiscing ac.",
      whatsapp: "0912838128",
      imageUrl: "/landing/sections/cabang-section/margahayu.webp",
    },
    {
      title: "Muezza Petshop Buah Batu",
      description:
        "Phasellus eget justo at libero suscipit pretium. Quisque nec sapien elit. Donec ullamcorper purus vitae felis commodo, a sodales neque elementum.",
      whatsapp: "0899123456",
      imageUrl: "/landing/sections/cabang-section/margahayu.webp",
    },
    {
      title: "Muezza Petshop Cibiru",
      description:
        "Integer sit amet mauris nec lorem blandit gravida. Nulla facilisi. Curabitur consequat varius sapien, vel hendrerit enim porta non.",
      whatsapp: "082233445566",
      imageUrl: "/landing/sections/cabang-section/margahayu.webp",
    },
    {
      title: "Muezza Petshop Dago",
      description:
        "Suspendisse potenti. Duis sed nisi ut mi ullamcorper aliquam. Curabitur ac erat sit amet ex pretium pretium.",
      whatsapp: "081122334455",
      imageUrl: "/landing/sections/cabang-section/margahayu.webp",
    },
  ];

  return (
    <section className="relative py-24 px-6 md:px-12 h-fit">
      <Image
        src="/elements/paw-trail-blue.webp"
        alt="Hero Background"
        width={1920}
        height={1920}
        priority
        className="absolute inset-0 m-auto object-contain md:w-[50%] w-full"
      />
      <h2 className="text-3xl md:text-4xl font-boogaloo font-semibold text-center">
        Cabang Muezza
      </h2>

      <div className="relative w-full h-[150vw] sm:h-[120vw] md:h-[35vw] md:max-h-[35rem]">
        {listCabang.map((cabang, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-8 opacity-0 animation-slide h-fit`}
            style={{
              animationDelay: `${index * 6}s`, // jeda antar slide
            }}
          >
            {/* Gambar kiri */}
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src={cabang.imageUrl}
                alt={cabang.title}
                width={600}
                height={400}
                className="rounded-2xl object-contain w-full aspect-square md:w-[90%]"
              />
            </div>

            {/* Konten kanan */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-semibold font-boogaloo mb-3">
                {cabang.title}
              </h2>
              <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
                {cabang.description}
              </p>
              <a
                href={`https://wa.me/${cabang.whatsapp}`}
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
