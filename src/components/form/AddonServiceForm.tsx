"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Eye, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddonService } from "@/type/addonService";
import { showAlert } from "@/lib/alert";

interface AddonServiceFormProps {
  addon?: AddonService;
  onSubmit?: (data: FormData) => void;
}

export default function AddonServiceForm({
  addon,
  onSubmit,
}: AddonServiceFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: addon?.name || "",
    description: addon?.description || "",
  });

  // Reset form ketika edit atau tambah baru
  useEffect(() => {
    if (addon) {
      setFormData({
        name: addon.name,
        description: addon.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [addon]);

  // Build FormData (tanpa image)
  const buildFormData = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    return data;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.description.trim()
    ) {
      showAlert(
        "Harus mengisi nama dan deskripsi.",
        "warning"
      );
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    const data = buildFormData();

    try {
      const url = addon
        ? `/api/addon-services/${addon.id}`
        : "/api/addon-services";

      const method = addon ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: data });

      if (!res.ok) {
        const err = await res.json();
        showAlert(err.message || "Gagal mengirim addon service.", "error");
        return;
      }

      showAlert(
        addon
          ? "Addon service updated successfully."
          : "Addon service created successfully.",
        "success"
      );
      router.refresh();
      setOpen(false);
      setShowPreview(false);

      onSubmit?.(data);

      if (!addon) {
        setFormData({
          name: "",
          description: "",
        });
      }
    } catch (err) {
      console.error(err);
      showAlert("Gagal mengirim addon service.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {addon ? (
          <Button variant="outline" className="gap-2">
            <SquarePen className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="default" className="flex gap-2">
            <PlusCircle className="w-4 h-4" /> Add Addon Service
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        {!showPreview ? (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {addon ? "Edit Addon Service" : "Add Addon Service"}
                </DialogTitle>
                <DialogDescription>
                  {addon
                    ? "Update addon service details."
                    : "Fill the form to create an addon service."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-4 space-y-4">
                {/* TITLE */}
                <div className="space-y-2">
                  <Label htmlFor="title">Addon Title</Label>
                  <Input
                    id="title"
                    placeholder="Premium Shampoo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    placeholder="Describe the addon"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>Preview Addon Service</DialogTitle>
                <DialogDescription>Review before submitting.</DialogDescription>
              </DialogHeader>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>

                {formData.description && (
                  <p>
                    <strong>Description:</strong> {formData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
              <Button onClick={handleConfirmSubmit}>Confirm & Submit</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
