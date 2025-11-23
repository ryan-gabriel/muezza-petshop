import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muezza Petshop",
  description:
    "Muezza Petshop adalah petshop lengkap yang menyediakan berbagai kebutuhan hewan peliharaan, mulai dari makanan kucing, makanan anjing, pasir kucing, vitamin, obat-obatan, kandang, hingga aksesoris hewan. Kami juga menawarkan layanan grooming kucing dan grooming anjing yang dilakukan oleh groomer berpengalaman dengan standar kebersihan tinggi. Dengan produk berkualitas, harga bersahabat, dan layanan cepat, Muezza Petshop menjadi pilihan terbaik untuk merawat dan memenuhi kebutuhan hewan peliharaan Anda.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`font-calibri antialiased w-full flex justify-center`}>
        {children}
      </body>
    </html>
  );
}
