"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  productId: number | string;
  initialVisibility: boolean;
}

export default function ProductVisibilityToggle({
  productId,
  initialVisibility,
}: Props) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleToggle = async () => {
    const newValue = !visibility;

    setVisibility(newValue); // Optimistic
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update visibility");

      toast.success("Visibility updated");
      router.refresh();
    } catch (err) {
      console.error(err);
      setVisibility(!newValue); // revert
      toast.error("Failed to update visibility");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="p-2 rounded-md transition-all cursor-pointer duration-150 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin opacity-60" />
      ) : visibility ? (
        <Eye className="h-5 w-5 text-primary transition-all duration-150 hover:scale-110" />
      ) : (
        <EyeOff className="h-5 w-5 text-muted-foreground transition-all duration-150 hover:scale-110" />
      )}
    </button>
  );
}
