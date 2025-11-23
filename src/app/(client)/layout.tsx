import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-[1440px] relative">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
