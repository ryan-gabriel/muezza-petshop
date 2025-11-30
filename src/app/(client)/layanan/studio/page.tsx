// app/studios/page.tsx
import Galleries from "@/components/page/studios/Galleries";
import PackageSection from "@/components/page/studios/PackageSection";
import StudioHeroSection from "@/components/page/studios/StudioHeroSection";
import { getStudiosClient } from "@/utils/studios";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ✅ Generate dynamic metadata untuk halaman studios
export async function generateMetadata(): Promise<Metadata> {
  const data = await getStudiosClient();
  const totalPackages = data.length;

  return {
    title: "Studio Fotografi | Muezza Petshop",
    description: `Temukan ${totalPackages} paket studio fotografi untuk hewan peliharaan di Muezza Petshop. Abadikan momen lucu kucing dan anjing Anda dengan kualitas profesional.`,
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
      title: "Studio Fotografi | Muezza Petshop",
      description: `Temukan ${totalPackages} paket studio fotografi untuk hewan peliharaan di Muezza Petshop.`,
      url: "https://muezza-petshop.vercel.app/studios",
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
      title: "Studio Fotografi | Muezza Petshop",
      description: `Temukan ${totalPackages} paket studio fotografi untuk hewan peliharaan di Muezza Petshop.`,
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

// Halaman studios
const page = async () => {
  const data = await getStudiosClient();
  return (
    <main className="overflow-x-hidden flex flex-col gap-16">
      <StudioHeroSection />
      <PackageSection packages={data} />
      <Galleries />
    </main>
  );
};

export default page;
