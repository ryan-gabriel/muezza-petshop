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
import { PlusCircle, Eye, SquarePenIcon } from "lucide-react";
import { ProductCategory } from "@/type/productCategory";
import { useRouter } from "next/navigation";

interface ProductCategoryFormProps {
  category?: ProductCategory;
  onSubmit?: () => void;
  trigger?: React.ReactNode;
}

export default function ProductCategoryForm({
  category,
  onSubmit,
  trigger,
}: ProductCategoryFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      const url = category
        ? `/api/product-categories/${category.id}`
        : "/api/product-categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit category");
      }

      router.refresh();
      setOpen(false);
      setShowPreview(false);
      if (onSubmit) onSubmit();
      if (!category) {
        // Reset form setelah submit sukses
        setFormData({
          name: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      alert("Failed to submit category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {category ? (
              <SquarePenIcon />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Add Category
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        {!showPreview ? (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {category ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  {category
                    ? "Update the category information below."
                    : "Fill in the form to create a new category."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-4 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* PREVIEW */}
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>Preview Category</DialogTitle>
                <DialogDescription>Review before submitting.</DialogDescription>
              </DialogHeader>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-3 border rounded-lg p-4">
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
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={loading}
              >
                Back to Edit
              </Button>
              <Button onClick={handleConfirmSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
