import SectionDiscount from "@/components/page/produk/SectionDiscount";
import Navbar from "@/components/ui/Navbar";
import { getProductClient } from "@/utils/products";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import React from "react";

const page = async () => {
  const data = await getProductClient();

  return (
    <>
      <Navbar />
      <main className="px-6 py-12 pt-28">
        {data.products.map((group, index) => (
          <React.Fragment key={group.slug}>
            <section className="mb-16">
              {/* Judul kategori */}
              <h2 className="text-4xl font-bold mb-6 text-center font-boogaloo">
                {group.category}
              </h2>

              <p className="text-center text-gray-700">{group.description}</p>

              {/* 3 produk teratas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl p-4 flex flex-col"
                  >
                    <div className="relative w-full aspect-[435/570]">
                      {/* Background full cover */}
                      <Image
                        src="/produk/image_bg.webp"
                        alt="Background Produk"
                        fill
                        className="object-cover"
                      />

                      {/* Product image centered */}
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-center mt-6">
                      {product.name}
                    </h3>

                    {/* Harga / Diskon */}
                    <div className="text-center font-medium mt-2">
                      {product.discount?.is_active ? (
                        <div className="flex flex-col items-center gap-1">
                          {/* Harga asli dicoret */}
                          <div className="flex gap-2 items-center">
                            <span className="text-gray-500 line-through text-sm">
                              Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                product.price
                              )}
                            </span>

                            <span className="text-red-500 font-semibold text-sm">
                              -{product.discount.discount_percent}%
                            </span>
                          </div>

                          {/* Harga setelah diskon */}
                          <span className="text-green-600 font-bold text-lg">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              product.price -
                                product.price *
                                  (product.discount.discount_percent / 100)
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-center font-bold text-lg">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center w-full">
                <a
                  href={`#`}
                  className="text-wrap w-fit px-4 py-4 rounded-sm border-2 border-green-800 text-green-800 hover:bg-green-100 transition flex items-center justify-center gap-2"
                >
                  Selengkapnya <MoveRight className="inline" />
                </a>
              </div>
            </section>

            {/* Tampilkan SectionDiscount hanya setelah kategori pertama */}
            {index === 0 && data.discounts.length > 0 && (
              <SectionDiscount list={data.discounts} />
            )}
          </React.Fragment>
        ))}
      </main>
    </>
  );
};

export default page;
