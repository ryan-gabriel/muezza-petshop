"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault(); // tetap open biar loadingnya kelihatan
        handleSignOut();
      }}
      className={`
    flex items-center justify-between relative
    transition-all
    ${loading ? "bg-black/5 text-black/40 pointer-events-none" : ""}
  `}
    >
      {/* Label */}
      <span className={`${loading ? "opacity-60" : ""}`}>Sign out</span>

      {/* Spinner */}
      {loading && (
        <div className="absolute right-3 flex items-center">
          <div className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-black/20 border-t-black" />
        </div>
      )}
    </DropdownMenuItem>
  );
}
