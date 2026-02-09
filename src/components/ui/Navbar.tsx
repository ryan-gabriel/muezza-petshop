"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ClientLinkButton from "./ClientLinkButton";

export default function Navbar({
  useBackground = false,
}: {
  useBackground?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const path = usePathname();

  const [openDropdown, setOpenDropdown] = useState(false); // desktop open state
  const [dropdownLocked, setDropdownLocked] = useState(false); // NEW lock state
  const [mobileDropdown, setMobileDropdown] = useState(false); // mobile

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/produk", label: "Produk" },
    { href: "/layanan", label: "Layanan" },
    { href: "/cabang", label: "Cabang" },
  ];

  const layananActive = path.startsWith("/layanan");

  const subItems = [
    { href: "/layanan/hotel", label: "Hotel" },
    { href: "/layanan/grooming", label: "Grooming" },
    { href: "/layanan/studio", label: "Studio" },
  ];

  // Reset saat pindah halaman
  useEffect(() => {
    setOpenDropdown(false);
    setMobileDropdown(false);
    setDropdownLocked(false); // NEW
  }, [path]);

  if (!mounted) return null;

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
      {/* CONDITIONAL BACKGROUND */}
      {useBackground && (
        <Image
          src="/navbar/navbar-bg.webp"
          alt="Navbar Background"
          width={1920}
          height={1920}
          priority
          className="
            object-cover lg:object-contain 
            absolute -top-28 lg:-top-12 right-0
            h-60 -z-50 lg:h-44 lg:w-3/4 w-full
          "
        />
      )}

      {/* LOGO */}
      <div className="flex items-center">
        <Image src="/logo.svg" width={60} height={60} alt="Logo Muezza" />
      </div>

      {/* DESKTOP NAV */}
      <div className="hidden md:flex items-center gap-10 font-semibold tracking-wide relative">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? path === "/" : path.startsWith(item.href);

          // DESKTOP DROPDOWN
          if (item.label === "Layanan") {
            return (
              <div key={item.href} className="relative group">
                {/* BUTTON */}
                <button
                  onClick={() => {
                    setDropdownLocked(!dropdownLocked); // lock/unlock
                    setOpenDropdown(!openDropdown); // toggle open
                  }}
                  onMouseEnter={() => {
                    if (!dropdownLocked) setOpenDropdown(true);
                  }}
                  className={`
                    pb-1 flex items-center gap-1 transition-colors
                    ${layananActive
                      ? "text-[#1D3A2F]"
                      : "text-black/70 hover:text-black"
                    }
                  `}
                >
                  Layanan
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${openDropdown ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>

                {/* UNDERLINE */}
                {layananActive && (
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-[#1D3A2F]" />
                )}

                {/* DROPDOWN */}
                <div
                  onMouseEnter={() => setOpenDropdown(true)}
                  onMouseLeave={() => {
                    if (!dropdownLocked) setOpenDropdown(false);
                  }}
                  className={`
                    absolute left-0 top-full mt-1 
                    w-48 glass shadow-xl rounded-xl py-3
                    border border-slate-200/50 z-50
                    transition-all duration-300 ease-in-out
                    ${openDropdown
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                    }
                  `}
                >
                  {subItems.map((sub) => {
                    const isSubActive = path.startsWith(sub.href);

                    return (
                      <ClientLinkButton
                        key={sub.href}
                        href={sub.href}
                        className={`
                          block px-4 py-2 transition
                          ${isSubActive
                            ? "bg-[#1D3A2F]/10 text-[#1D3A2F] font-semibold"
                            : "hover:bg-black/5"
                          }
                        `}
                      >
                        {sub.label}
                      </ClientLinkButton>
                    );
                  })}
                </div>
              </div>
            );
          }

          // NORMAL DESKTOP LINKS
          return (
            <ClientLinkButton
              key={item.href}
              href={item.href}
              className={`
                relative pb-1 transition-colors
                ${isActive ? "text-[#1D3A2F]" : "text-black/70 hover:text-black"
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
            </ClientLinkButton>
          );
        })}
      </div>

      {/* MOBILE MENU */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="touch-target">
              <Menu className="w-7 h-7 text-black" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-80 px-6 py-8 bg-white/95 backdrop-blur-lg">
            <SheetHeader className="flex flex-col items-start">
              <SheetTitle className="text-xl font-bold tracking-wide text-[#1D3A2F]">
                Menu
              </SheetTitle>
              <p className="text-sm text-black/50 mt-1">
                Akses navigasi utama
              </p>
            </SheetHeader>

            <div className="w-full h-px bg-black/10" />

            {/* MOBILE NAV */}
            <div className="flex flex-col gap-4 text-lg font-medium mt-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? path === "/" : path.startsWith(item.href);

                // MOBILE DROPDOWN
                if (item.label === "Layanan") {
                  return (
                    <div key="layanan-mobile" className="flex flex-col">
                      <button
                        onClick={() => setMobileDropdown(!mobileDropdown)}
                        className={`
                          px-2 py-2 flex items-center justify-between rounded-lg transition-all
                          ${layananActive
                            ? "text-[#1D3A2F] bg-[#1D3A2F]/10 font-semibold"
                            : "text-black/70 hover:bg-black/5 hover:text-black"
                          }
                        `}
                      >
                        <span>Layanan</span>

                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${mobileDropdown ? "rotate-180" : "rotate-0"
                            }`}
                        />
                      </button>

                      {mobileDropdown && (
                        <div className="ml-4 mt-2 flex flex-col gap-3 text-base">
                          {subItems.map((sub) => {
                            const isSubActive = path.startsWith(sub.href);

                            return (
                              <ClientLinkButton
                                key={sub.href}
                                href={sub.href}
                                className={`
                                  px-2 py-1 rounded-md
                                  ${isSubActive
                                    ? "text-[#1D3A2F] font-semibold bg-[#1D3A2F]/10"
                                    : "text-black/70"
                                  }
                                `}
                              >
                                {sub.label}
                              </ClientLinkButton>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // MOBILE NORMAL LINK
                return (
                  <ClientLinkButton
                    key={item.href}
                    href={item.href}
                    className={`
                      px-2 py-2 rounded-lg transition-all
                      ${isActive
                        ? "text-[#1D3A2F] bg-[#1D3A2F]/10 font-semibold"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                      }
                    `}
                  >
                    {item.label}
                  </ClientLinkButton>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-black/10">
              <p className="text-xs text-black/40">© 2025 Muezza Petshop</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
