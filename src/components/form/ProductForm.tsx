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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Pencil, Upload, X, Eye } from "lucide-react";
import Image from "next/image";
import { Product, ProductCreateRequest } from "@/type/product";
import { ProductCategory } from "@/type/productCategory";

interface ProductFormProps {
  product?: Product;
  onSubmit?: (data: FormData) => void;
  trigger?: React.ReactNode;
  productCategories: ProductCategory[];
}

export default function ProductForm({
  product,
  onSubmit,
  trigger,
  productCategories,
}: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: product?.name || "",
    price: product?.price || 0,
    category: product?.category || 0,
    description: product?.description || "",
    image_url: product?.image_url,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    product?.image_url || ""
  );
  const [isConverting, setIsConverting] = useState(false);

  // === Image convert & preview ===
  const handleImageConvert = async (file: File): Promise<void> => {
    setIsConverting(true);
    try {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (!result || typeof result !== "string") return;

        const img = new window.Image();
        img.src = result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          let { width, height } = img;
          const maxSize = 1200;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const webpFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, ".webp"),
                  { type: "image/webp" }
                );
                setImageFile(webpFile);
                setImagePreview(URL.createObjectURL(blob));
              }
              setIsConverting(false);
            },
            "image/webp",
            0.85
          );
        };
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error converting image:", error);
      setIsConverting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageConvert(file);
  };

  // === Drag and Drop ===
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageConvert(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: undefined }));
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        image_url: product.image_url,
      });
      setImagePreview(product.image_url || "");
    } else {
      setFormData({
        name: "",
        price: 0,
        category: 0,
        description: "",
        image_url: undefined,
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [product]);

  const buildFormData = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    if (formData.category) data.append("category", String(formData.category));
    data.append("description", formData.description || "");
    if (imageFile) data.append("image", imageFile);
    else if (formData.image_url) data.append("image_url", formData.image_url);
    return data;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    const data = buildFormData();

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit product");
      }

      if (onSubmit) onSubmit(data);
      setOpen(false);
      setShowPreview(false);
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="flex items-center gap-2">
            {product ? (
              <>
                <Pencil className="w-4 h-4" /> Edit Product
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Add Product
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
                  {product ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {product
                    ? "Update the product information below."
                    : "Fill in the form to create a new product."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-4 space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                      >
                        {isConverting
                          ? "Converting to WebP..."
                          : "Click to upload or drag & drop an image"}
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isConverting}
                      />
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        category: Number(val),
                      })
                    }
                    value={String(formData.category)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isConverting}>
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
                <DialogTitle>Preview Product</DialogTitle>
                <DialogDescription>Review before submitting.</DialogDescription>
              </DialogHeader>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {imagePreview && (
                <div>
                  <Image
                    src={imagePreview}
                    alt={formData.name}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="space-y-3 border rounded-lg p-4">
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Price:</strong> {formatPrice(formData.price)}
                </p>
                <p>
                  <strong>Category:</strong> {formData.category}
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
