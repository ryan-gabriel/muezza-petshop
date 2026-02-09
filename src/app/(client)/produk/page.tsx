// app/page.tsx
import SectionDiscount from "@/components/page/produk/SectionDiscount";
import Navbar from "@/components/ui/Navbar";
import { getProductClient } from "@/utils/products";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import type { Metadata } from "next";
import EmptyProduct from "@/components/page/produk/EmptyProduct";
import ClientLinkButton from "@/components/ui/ClientLinkButton";

export const dynamic = "force-dynamic";

// ✅ Generate dynamic metadata berdasarkan data API
export async function generateMetadata(): Promise<Metadata> {
  const data = await getProductClient();

  // Ambil jumlah produk / kategori untuk deskripsi dinamis
  const totalCategories = data.products.length;
  const totalProducts = data.products.reduce(
    (sum, group) => sum + group.products.length,
    0
  );

  return {
    title: `Produk Terbaru | Muezza Petshop`,
    description: `Temukan ${totalProducts} produk hewan peliharaan di ${totalCategories} kategori di Muezza Petshop. Makanan, vitamin, aksesoris, dan layanan grooming untuk kucing & anjing.`,
    themeColor: "#ffffff",
    icons: {
      icon: [
        { url: "/favicon-16x16.ico", sizes: "16x16", type: "image/x-icon" },
        { url: "/favicon-32x32.ico", sizes: "32x32", type: "image/x-icon" },
        { url: "/favicon-48x48.ico", sizes: "48x48", type: "image/x-icon" },
      ],
      apple: "/apple-touch-icon.png",
      shortcut: "/favicon-32x32.ico",
    },
    openGraph: {
      title: "Produk Terbaru | Muezza Petshop",
      description: `Temukan ${totalProducts} produk hewan peliharaan di ${totalCategories} kategori.`,
      url: "https://muezza-petshop.vercel.app/list-produk",
      siteName: "Muezza Petshop",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Produk Terbaru | Muezza Petshop",
      description: `Temukan ${totalProducts} produk hewan peliharaan di ${totalCategories} kategori.`,
      images: [
        {
          url: "/twitter-image.png",
          width: 1200,
          height: 675,
          type: "image/png",
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

// Halaman produk
const page = async () => {
  const data = await getProductClient();

  return (
    <>
      <Navbar useBackground={true} />
      <main className="px-6 py-12 pt-28">
        {data.products.map((group, index) => (
          <React.Fragment key={group.slug}>
            <section className={`${group.products.length === 0 ? "" : "mb-16"}`}>
              <h2 className="text-4xl font-bold mb-6 text-center font-boogaloo">
                {group.category}
              </h2>
              <p className="text-center text-gray-700">{group.description}</p>

              {group.products.length === 0 ? (
                <div className="">
                  <EmptyProduct category={group.category} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {group.products.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="rounded-xl p-4 flex flex-col"
                      >
                        <div className="relative w-full aspect-[435/570]">
                          <Image
                            src="/produk/image_bg.webp"
                            alt="Background Produk"
                            fill
                            className="object-cover"
                          />
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
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center w-full">
                    <ClientLinkButton
                      href={`/list-produk?category=${group.slug}`}
                      className="text-wrap w-fit px-4 py-4 rounded-sm border-2 border-green-800 text-green-800 hover:bg-green-100 transition flex items-center justify-center gap-2"
                    >
                      Selengkapnya <MoveRight className="inline" />
                    </ClientLinkButton>
                  </div>
                </>
              )}
            </section>

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
