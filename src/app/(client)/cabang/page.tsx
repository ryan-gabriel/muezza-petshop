import Navbar from "@/components/ui/Navbar";
import { getBranches } from "@/utils/branches";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
export const dynamic = "force-dynamic"; // di page.tsx


const Page = async () => {
  let branches = [];

  try {
    branches = await getBranches();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  } catch (_: any) {
    return (
      <main className="px-6 py-12 pt-28">
        <p className="text-center text-gray-500">
          Terjadi kesalahan saat memuat data cabang.
        </p>
      </main>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <main className="px-6 py-12 pt-28">
        <p className="text-center text-gray-500">Belum ada cabang.</p>
      </main>
    );
  }

  return (
    <>
      <Navbar useBackground={true} />
      <main className="px-6 py-12 pt-28 space-y-14 md:space-y-20">
        <h2 className="font-boogaloo text-4xl md:text-5xl text-center mt-6 md:mt-10">
          Cabang Muezza
        </h2>

        {branches.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <section
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
            >
              {/* --- GAMBAR --- */}
              <div
                className={`
                  w-full flex justify-center
                  ${isEven ? "md:order-1" : "md:order-2"}
                `}
              >
                <div className="relative w-[80%] md:w-[60%] aspect-square">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={1080}
                    height={1080}
                    className="w-full h-full object-contain"
                  />
                  <Image
                    src="/cabang/image-bg.webp"
                    alt="background"
                    width={1080}
                    height={1080}
                    className="absolute inset-0 -z-50 object-contain md:object-cover"
                  />
                </div>
              </div>

              {/* --- KONTEN --- */}
              <div
                className={`
                  space-y-4 text-center md:text-left
                  ${!isEven ? "md:order-1 md:pl-20" : "md:order-2"}
                `}
              >
                <h2 className="text-2xl md:text-3xl font-bold font-boogaloo">
                  {item.name}
                </h2>

                <p className="text-gray-600 leading-relaxed font-calibri mx-auto md:mx-0 w-full md:w-3/4">
                  {item.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
                  <Link
                    href={item.google_map_url}
                    target="_blank"
                    className="px-8 py-3 rounded-full flex gap-2 text-xl items-center border bg-[#B0D9F0] hover:bg-sky-300 transition justify-center"
                  >
                    Lokasi <MapPin />
                  </Link>

                  <Link
                    href={`https://wa.me/${item.whatsapp_number}`}
                    target="_blank"
                    className="px-8 py-3 rounded-full flex gap-2 text-xl items-center border bg-green-500 hover:bg-green-600 transition justify-center"
                  >
                    Whatsapp <Phone />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
};

export default Page;
