// app/list-produk/page.tsx
import ListProdukHeroSection from "@/components/page/list-produk/ListProdukHeroSection";
import ListProdukSection from "@/components/page/list-produk/ListProdukSection";
import LogoProdukSection from "@/components/page/list-produk/LogoProdukSection";
import TestimoniSection from "@/components/page/list-produk/TestimoniSection";
import Navbar from "@/components/ui/Navbar";
import React from "react";
import type { Metadata } from "next";

// ✅ Metadata untuk halaman list-produk
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Daftar Produk | Muezza Petshop",
    description:
      "Jelajahi semua produk hewan peliharaan terbaik di Muezza Petshop. Makanan, vitamin, aksesoris, dan layanan grooming untuk kucing & anjing dengan kualitas terbaik.",
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
      title: "Daftar Produk | Muezza Petshop",
      description:
        "Temukan semua produk hewan peliharaan terbaik di Muezza Petshop. Makanan, vitamin, aksesoris, dan layanan grooming berkualitas.",
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
      title: "Daftar Produk | Muezza Petshop",
      description:
        "Temukan semua produk hewan peliharaan terbaik di Muezza Petshop. Makanan, vitamin, aksesoris, dan layanan grooming berkualitas.",
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

// Halaman list-produk
const page = ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) => {
  return (
    <>
      <Navbar useBackground={true} />
      <main className="overflow-x-hidden">
        <ListProdukHeroSection />
        <LogoProdukSection />
        <ListProdukSection searchParams={searchParams} />
        <TestimoniSection />
      </main>
    </>
  );
};

export default page;
