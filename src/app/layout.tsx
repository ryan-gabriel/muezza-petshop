// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Muezza Petshop",
  description:
    "Muezza Petshop adalah petshop lengkap yang menyediakan makanan, vitamin, aksesoris, dan layanan grooming untuk hewan peliharaan dengan kualitas terbaik dan harga bersahabat.",
  themeColor: "#ffffff",
  icons: {
    // Favicon untuk tab browser, bookmark, shortcut desktop
    icon: [
      { url: "/favicon-16x16.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon-32x32.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-48x48.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    // Apple Touch Icon untuk iOS
    apple: "/apple-touch-icon.png",
    // Shortcut / high-res favicon
    shortcut: "/favicon-32x32.ico",
  },
  openGraph: {
    title: "Muezza Petshop",
    description:
      "Toko hewan peliharaan lengkap untuk kucing, anjing, dan hewan lainnya. Produk berkualitas dan layanan cepat.",
    url: "https://muezza-petshop.vercel.app/",
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
    title: "Muezza Petshop",
    description:
      "Toko hewan peliharaan lengkap untuk kucing, anjing, dan hewan lainnya. Produk berkualitas dan layanan cepat.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-calibri antialiased w-full flex justify-center">
        {children}
      </body>
    </html>
  );
}
