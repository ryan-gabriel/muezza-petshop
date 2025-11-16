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
import { PlusCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddonService } from "@/type/addonService";

interface AddonServiceFormProps {
  addon?: AddonService;
  onSubmit?: (data: FormData) => void;
  trigger?: React.ReactNode;
}

export default function AddonServiceForm({
  addon,
  onSubmit,
  trigger,
}: AddonServiceFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: addon?.title || "",
    description: addon?.description || "",
    price: addon?.price || 0,
  });

  // Reset form ketika edit atau tambah baru
  useEffect(() => {
    if (addon) {
      setFormData({
        title: addon.title,
        description: addon.description || "",
        price: addon.price,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
      });
    }
  }, [addon]);

  // Build FormData (tanpa image)
  const buildFormData = () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description || "");
    data.append("price", String(formData.price));
    return data;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      if (!res.ok) throw new Error("Failed to submit");

      router.refresh();
      setOpen(false);
      setShowPreview(false);

      onSubmit?.(data);

      if (!addon) {
        setFormData({
          title: "",
          description: "",
          price: 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
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
                    required
                    placeholder="Premium Shampoo"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
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

                {/* PRICE */}
                <div className="space-y-2">
                  <Label>Price (IDR)</Label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
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
                  <strong>Title:</strong> {formData.title}
                </p>

                {formData.description && (
                  <p>
                    <strong>Description:</strong> {formData.description}
                  </p>
                )}

                <p>
                  <strong>Price:</strong> Rp{" "}
                  {formData.price.toLocaleString("id-ID")}
                </p>
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
