"use client";

import { Discount } from "@/type/discount";
import { Product } from "@/type/product";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

const UnggulanSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState<
    (Product & { discount: Discount | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch Data
  useEffect(() => {
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const res = await fetch(`${baseUrl}/api/products?is_featured=true`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data);
        } else {
          setEmpty(true);
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error("Error fetch featured products", err);
        setEmpty(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // scroll logic
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5); // Tambah threshold kecil
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // Tambah threshold kecil
    }
  };

  // Re-check scroll setelah data loaded dan setiap kali featuredProducts berubah
  useEffect(() => {
    if (!loading && featuredProducts.length > 0) {
      // Delay sedikit untuk memastikan DOM sudah ter-render
      setTimeout(() => {
        checkScroll();
      }, 100);
    }
  }, [loading, featuredProducts]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      // Initial check
      checkScroll();
      
      // Add scroll listener
      scrollElement.addEventListener("scroll", checkScroll);
      
      // Add resize listener untuk handle perubahan ukuran layar
      window.addEventListener("resize", checkScroll);
      
      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [featuredProducts]); // Tambahkan dependency featuredProducts

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="my-12 w-full px-4 md:px-8">
      <h2 className="font-boogaloo text-4xl md:text-5xl text-center mb-8 text-gray-800">
        Produk Unggulan Muezza
      </h2>

      {/* Jika loading → tampilkan skeleton */}
      {loading && (
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[280px] md:min-w-[320px] p-5 bg-gray-200 animate-pulse rounded-2xl"
            >
              <div className="aspect-square w-full bg-gray-300 rounded-xl" />
              <div className="h-6 bg-gray-300 mt-4 rounded-md"></div>
              <div className="h-4 bg-gray-300 mt-2 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Jika tidak ada produk unggulan */}
      {!loading && empty && (
        <p className="text-center text-gray-500 text-lg">
          Belum ada produk unggulan saat ini.
        </p>
      )}

      {/* Jika ada data */}
      {!loading && !empty && (
        <div className="relative flex items-center gap-4">
          {/* Tombol Kiri */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`
              hidden md:flex
              bg-white border-2 border-[#B0D9F0] 
              w-12 h-12 rounded-full shadow-lg
              items-center justify-center
              transition-all duration-200
              hover:bg-[#B0D9F0] hover:scale-110
              disabled:opacity-30 disabled:cursor-not-allowed
              flex-shrink-0 z-10
            `}
          >
            <span className="text-2xl font-bold text-gray-700">‹</span>
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 w-full overflow-x-auto scroll-smooth scrollbar-hide pb-4"
          >
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="
                  min-w-[280px] md:min-w-[320px] 
                  p-5 rounded-2xl shadow-lg
                  flex flex-col items-center
                  bg-white border border-gray-100
                  transition-transform duration-200
                  hover:shadow-xl hover:-translate-y-1
                  relative
                "
              >
                {/* Diskon */}
                {product.discount && (
                  <div className="w-full flex justify-end absolute top-4 right-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{product.discount.discount_percent}%
                    </span>
                  </div>
                )}

                {/* Gambar */}
                <div className="aspect-square w-full bg-gradient-to-br from-[#B0D9F0] to-[#89C4E8] rounded-xl flex items-center justify-center mb-4 p-4">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-contain w-[80%] drop-shadow-lg"
                  />
                </div>

                {/* Nama */}
                <h3 className="font-semibold text-2xl font-boogaloo text-center mb-3 text-gray-800 min-h-[60px] flex items-center">
                  {product.name}
                </h3>

                {/* Harga */}
                <div className="flex justify-center items-center gap-4 mb-4">
                  {product.discount ? (
                    <>
                      <span className="text-gray-400 line-through text-sm">
                        {product.price.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                      <span className="text-green-600 font-bold text-xl">
                        {(
                          product.price -
                          (product.price * product.discount.discount_percent) /
                            100
                        ).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-800 font-bold text-xl">
                      {product.price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  )}
                </div>

                {/* WA Button */}
                <a
                  className="
                    w-full bg-gradient-to-r from-[#B0D9F0] to-[#89C4E8]
                    py-3 text-center rounded-full 
                    font-boogaloo text-xl
                    transition-all duration-200
                    hover:shadow-md hover:scale-105
                    text-gray-800 font-semibold
                  "
                  href={`https://wa.me/6281222930909?text=${encodeURIComponent(
                    `Halo Muezza! Saya ingin membeli produk "${product.name}". Apa masih tersedia?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Beli Sekarang
                </a>
              </div>
            ))}
          </div>

          {/* Tombol Kanan */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`
              hidden md:flex
              bg-white border-2 border-[#B0D9F0]
              w-12 h-12 rounded-full shadow-lg
              items-center justify-center
              transition-all duration-200
              hover:bg-[#B0D9F0] hover:scale-110
              disabled:opacity-30 disabled:cursor-not-allowed
              flex-shrink-0 z-10
            `}
          >
            <span className="text-2xl font-bold text-gray-700">›</span>
          </button>
        </div>
      )}

      {!loading && !empty && (
        <div className="flex md:hidden justify-center gap-4 mt-6">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`
            bg-white border-2 border-[#B0D9F0]
            px-6 py-3 rounded-full shadow-md
            font-semibold text-xl
            transition-all duration-200
            hover:bg-[#B0D9F0]
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          >
            ‹ Prev
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`
            bg-white border-2 border-[#B0D9F0]
            px-6 py-3 rounded-full shadow-md
            font-semibold text-xl
            transition-all duration-200
            hover:bg-[#B0D9F0]
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          >
            Next ›
          </button>
        </div>
      )}
    </section>
  );
};

export default UnggulanSection;