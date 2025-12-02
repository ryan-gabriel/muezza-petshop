"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

const ClientLinkButton = ({
  className,
  children,
  href,
}: {
  className?: string;
  children: ReactNode;
  href: string;
}) => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Needed for portal (CSR only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset loading after navigation
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  const handleClick = () => {
    setLoading(true);
  };

  return (
    <>
      <Link href={href} onClick={handleClick} className={className}>
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : children}
      </Link>

      {/* FULLSCREEN LOADING via PORTAL */}
      {mounted && loading &&
        createPortal(
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[999999]">
            <Loader2 className="animate-spin h-10 w-10 text-green-700" />
          </div>,
          document.body
        )}
    </>
  );
};

export default ClientLinkButton;
