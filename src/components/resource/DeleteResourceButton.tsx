"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { showAlert } from "@/lib/alert";

interface DeleteResourceButtonProps {
  id: number | string;
  apiUrl: string; // contoh: "/api/grooming" → final: /api/grooming/12
  title?: string; // (optional) judul dialog, default: "Delete Item"
  message?: string; // (optional) pesan dialog
  onDelete?: () => void; // callback setelah berhasil delete
}

export default function DeleteResourceButton({
  id,
  apiUrl,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  onDelete,
}: DeleteResourceButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showAlert(errorData.message || "Gagal menghapus item.", "error");
        throw new Error(errorData.message || "Failed to delete");
      }

      showAlert("Item berhasil dihapus.", "success");

      onDelete?.();
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
