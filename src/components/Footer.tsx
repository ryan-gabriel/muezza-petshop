import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const mainLinks = [
    { href: "/layanan/hotel", label: "Layanan Hotel" },
    { href: "/layanan/grooming", label: "Layanan Grooming" },
    { href: "/layanan/studio", label: "Layanan Studio" },
    // { href: "/faqs", label: "FAQs" },
    // { href: "/how-it-works", label: "How It Works" },
  ];

  const petLinks = [
    { href: "/cabang", label: "Cabang Muezza" },
    { href: "/produk", label: "Produk Muezza" },
    { href: "/dashboard", label: "Dashboard admin" },
    // { href: "/call-us", label: "Call Us" },
    // { href: "/blog", label: "Blog" },
  ];

  return (
    <footer className="bg-primary-blue mt-32 relative flex flex-col items-center">
      {/* Cat Image */}
      <div className="w-full flex justify-center -mt-36 sm:-mt-40">
        <Image
          src="/landing/sections/footer/footer-cat.webp"
          alt="Muezza Cat"
          width={280}
          height={350}
          className="object-contain w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] h-auto"
          priority
        />
      </div>

      {/* Footer Links */}
      <div className="w-full px-6 sm:px-10 md:px-20 lg:px-28 py-10 flex flex-col md:flex-row justify-between gap-10 md:gap-0 md:-mt-16">
        {/* Left Links */}
        <div className="flex flex-col gap-4 md:gap-6 items-center md:items-start text-center md:text-left w-full md:w-1/3">
          {mainLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="font-semibold text-base sm:text-lg hover:underline transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Center Section */}
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full md:w-1/3">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Muezza Logo"
              width={90}
              height={50}
              className="object-contain"
            />
          </Link>
          <div className="flex gap-6">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <Icon
                key={i}
                width={32}
                height={32}
                className="cursor-pointer hover:opacity-80 transition"
              />
            ))}
          </div>
        </div>

        {/* Right Links */}
        <div className="flex flex-col gap-4 md:gap-6 items-center md:items-end text-center md:text-right w-full md:w-1/3">
          {petLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="font-semibold text-base sm:text-lg hover:underline transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer bottom line */}
      <div className="w-full text-center py-6 border-t border-white/20 text-sm">
        © {new Date().getFullYear()} Muezza. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
