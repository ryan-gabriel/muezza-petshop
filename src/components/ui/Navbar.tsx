"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const path = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/produk", label: "Produk" },
    { href: "/layanan", label: "Layanan" },
    { href: "/cabang", label: "Cabang" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <nav
      className="
        absolute top-0 left-0 right-0 
        w-full z-50
        flex justify-between items-center 
        px-6 md:px-12 py-4 md:pt-3 lg:py-1 xl:py-2
        bg-transparent
      "
    >
      {/* BACKGROUND IMAGE (TIDAK DIUBAH) */}
      <Image
        src="/navbar/navbar-bg.webp"
        alt="Navbar Background"
        width={1920}
        height={1920}
        priority
        className="object-cover lg:object-contain absolute -top-28 lg:-top-12 right-0 h-60 -z-50 lg:h-44 lg:w-3/4 w-full"
      />

      {/* LOGO */}
      <div className="flex items-center">
        <Image src="/logo.svg" width={60} height={60} alt="Logo Muezza" />
      </div>

      {/* DESKTOP NAV (TETAP SAMA) */}
      <div className="hidden md:flex items-center gap-10 font-semibold tracking-wide">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? path === "/" : path.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative pb-1 transition-colors
                ${
                  isActive ? "text-[#1D3A2F]" : "text-black/70 hover:text-black"
                }
              `}
            >
              {item.label}

              <span
                className={`
                  absolute left-0 -bottom-1 h-[2px] w-full bg-[#1D3A2F]
                  transition-opacity duration-300
                  ${isActive ? "opacity-100" : "opacity-0"}
                `}
              />
            </Link>
          );
        })}
      </div>

      {/* MOBILE MENU BUTTON (TAMBAHAN) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6 text-black" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 px-6 py-6">
            {/* Header */}
            <SheetHeader className="flex flex-col items-start">
              <SheetTitle className="text-xl font-bold tracking-wide text-[#1D3A2F]">
                Menu
              </SheetTitle>
              <p className="text-sm text-black/50 mt-1">Akses navigasi utama</p>
            </SheetHeader>

            {/* Divider */}
            <div className="w-full h-px bg-black/10" />

            {/* Navigation Links */}
            <div className="flex flex-col gap-4 text-lg font-medium">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? path === "/" : path.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                px-2 py-2 rounded-lg transition-all
                ${
                  isActive
                    ? "text-[#1D3A2F] bg-[#1D3A2F]/10 font-semibold"
                    : "text-black/70 hover:bg-black/5 hover:text-black"
                }
              `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Footer Extra (opsional) */}
            <div className="mt-8 pt-6 border-t border-black/10">
              <p className="text-xs text-black/40">© 2025 Muezza Petshop</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
