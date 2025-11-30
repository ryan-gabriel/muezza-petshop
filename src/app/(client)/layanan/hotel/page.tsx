// app/hotel/page.tsx
import Facilities from "@/components/page/hotel/Facilities";
import HotelHeroSection from "@/components/page/hotel/HotelHeroSection";
import RoomTypes from "@/components/page/hotel/RoomTypes";
import YoutubeVideo from "@/components/page/reusable/YoutubeVideo";
import { getHotelsClient } from "@/utils/hotels";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ✅ Generate dynamic metadata untuk halaman hotel
export async function generateMetadata(): Promise<Metadata> {
  const data = await getHotelsClient();
  const totalRooms = data.length;

  return {
    title: "Pets Hotel | Muezza Petshop",
    description: `Temukan ${totalRooms} tipe kamar di Pets Hotel Muezza. Nikmati fasilitas premium dan pengalaman menginap terbaik untuk hewan peliharaan Anda.`,
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
      title: "Pets Hotel | Muezza Petshop",
      description: `Temukan ${totalRooms} tipe kamar di Pets Hotel Muezza. Nikmati fasilitas premium dan pengalaman menginap terbaik untuk hewan peliharaan Anda.`,
      url: "https://muezza-petshop.vercel.app/hotel",
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
      title: "Pets Hotel | Muezza Petshop",
      description: `Temukan ${totalRooms} tipe kamar di Pets Hotel Muezza. Nikmati fasilitas premium dan pengalaman menginap terbaik untuk hewan peliharaan Anda.`,
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

// Halaman hotel
const page = async () => {
  const data = await getHotelsClient();

  return (
    <main className="overflow-x-hidden">
      <HotelHeroSection />
      <RoomTypes roomTypes={data} />
      <Facilities />
      <YoutubeVideo
        title="Tour Pets Hotel Muezza !"
        description="Tonton bagaimana Mogli menginap di Pet Hotel Muezza"
        url="https://www.youtube.com/embed/mxSFbLk-eaY?si=268ZsskV3mdcaJqc"
      />
    </main>
  );
};

export default page;
