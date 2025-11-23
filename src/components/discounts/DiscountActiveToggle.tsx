"use client";

import { useState } from "react";
import { CheckCircle, CircleOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  discountId: number | string;
  initialActive: boolean;
}

export default function DiscountActiveToggle({
  discountId,
  initialActive,
}: Props) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleToggle = async () => {
    const newValue = !isActive;

    // Optimistic UI
    setIsActive(newValue);
    setLoading(true);

    try {
      const res = await fetch(`/api/discounts/${discountId}?active=true`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to update active status");

      toast.success("Status updated");
      router.refresh();
    } catch (err) {
      console.error(err);

      // Revert UI
      setIsActive(!newValue);

      toast.error("Failed to update active status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="p-2 rounded-md transition-all bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin opacity-60" />
      ) : isActive ? (
        <CheckCircle className="h-5 w-5 text-green-600 transition-all duration-150 hover:scale-110" />
      ) : (
        <CircleOff className="h-5 w-5 text-gray-400 transition-all duration-150 hover:scale-110" />
      )}
    </button>
  );
}
