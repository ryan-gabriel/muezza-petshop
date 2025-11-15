"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Redirect ke halaman login setelah sign out
        router.push("/login");
      } else {
        console.error("Failed to sign out");
      }
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <span>Sign out</span>
    </DropdownMenuItem>
  );
}
