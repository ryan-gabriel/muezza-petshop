"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  // Reset loading ketika page sudah berpindah
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  const handleClick = () => {
    setLoading(true);
  };

  return (
    <>
      {/* LINK */}
      <Link href={href} onClick={handleClick} className={className}>
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : children}
      </Link>

      {/* FULLSCREEN LOADING OVERLAY (scroll tetap jalan) */}
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <Loader2 className="animate-spin h-10 w-10 text-green-700" />
        </div>
      )}
    </>
  );
};

export default ClientLinkButton;
