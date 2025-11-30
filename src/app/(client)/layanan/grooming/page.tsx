// app/groomings/page.tsx
import AddonSection from "@/components/page/groomings/AddonSection";
import GroomingHeroSection from "@/components/page/groomings/GroomingHeroSections";
import ServicesSection from "@/components/page/groomings/ServicesSection";
import YoutubeVideo from "@/components/page/reusable/YoutubeVideo";
import { getAddonClient } from "@/utils/addon-services";
import { getGroomingsClient } from "@/utils/groomings";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ✅ Generate dynamic metadata untuk halaman Groomings
export async function generateMetadata(): Promise<Metadata> {
  const groomingData = await getGroomingsClient();
  const addonData = await getAddonClient();

  const totalServices = groomingData.length;
  const totalAddons = addonData.length;

  return {
    title: "Layanan Grooming | Muezza Petshop",
    description: `Nikmati layanan grooming profesional untuk hewan peliharaan Anda. Tersedia ${totalServices} layanan utama dan ${totalAddons} addon tambahan untuk kucing & anjing.`,
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
      title: "Layanan Grooming | Muezza Petshop",
      description: `Nikmati layanan grooming profesional untuk hewan peliharaan Anda. Tersedia ${totalServices} layanan utama dan ${totalAddons} addon tambahan.`,
      url: "https://muezza-petshop.vercel.app/groomings",
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
      title: "Layanan Grooming | Muezza Petshop",
      description: `Nikmati layanan grooming profesional untuk hewan peliharaan Anda. Tersedia ${totalServices} layanan utama dan ${totalAddons} addon tambahan.`,
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

// Halaman Groomings
const page = async () => {
  const groomingData = await getGroomingsClient();
  const addonData = await getAddonClient();

  return (
    <main className="overflow-x-hidden">
      <GroomingHeroSection />
      <ServicesSection services={groomingData} />
      <AddonSection services={addonData} />
      <YoutubeVideo
        title="Grooming di Muezza !"
        description="Tonton bagaimana peliharaan anda digrooming oleh muezza pet shop"
        url="https://www.youtube.com/embed/mxSFbLk-eaY?si=268ZsskV3mdcaJqc"
      />
    </main>
  );
};

export default page;
