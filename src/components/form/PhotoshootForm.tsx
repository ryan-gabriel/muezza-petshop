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
import { PlusCircle, Upload, X, Eye, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PhotoshootPackage } from "@/type/photoshoot";
import { showAlert } from "@/lib/alert";

interface PhotoshootFormProps {
  packageItem?: PhotoshootPackage;
  onSubmit?: (data: FormData) => void;
}

export default function PhotoshootForm({
  packageItem,
  onSubmit,
}: PhotoshootFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    name: packageItem?.name || "",
    price: packageItem?.price || 0,
    features: Array.isArray(packageItem?.features) ? packageItem.features : [],
    image_url: packageItem?.image_url,
  });

  const [newFeature, setNewFeature] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    packageItem?.image_url || ""
  );

  // ============================================
  // Convert to WebP
  // ============================================
  const handleImageConvert = async (file: File): Promise<void> => {
    setIsConverting(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
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
                const webp = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, ".webp"),
                  { type: "image/webp" }
                );
                setImageFile(webp);
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
    } catch (err) {
      console.error("Convert failed:", err);
      setIsConverting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageConvert(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageConvert(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((p) => ({ ...p, image_url: undefined }));
  };

  useEffect(() => {
    if (packageItem) {
      setFormData({
        name: packageItem.name,
        price: packageItem.price,
        features: Array.isArray(packageItem.features)
          ? packageItem.features
          : JSON.parse(packageItem.features ?? "[]"),
        image_url: packageItem.image_url ?? undefined,
      });
      setImagePreview(packageItem.image_url || "");
    } else {
      setFormData({
        name: "",
        price: 0,
        features: [],
        image_url: undefined,
      });
      setImagePreview("");
    }

    setImageFile(null);
    setNewFeature("");
  }, [packageItem]);

  const buildFormData = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", String(formData.price));

    data.append("features", JSON.stringify(formData.features));

    if (imageFile) {
      data.append("image", imageFile);
    } else if (formData.image_url) {
      data.append("image_url", formData.image_url);
    }

    return data;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      formData.price <= 0 ||
      isNaN(formData.price) ||
      !isFinite(formData.price)
    ) {
      showAlert("Harus mengisi nama dan harga yang valid.", "warning");
      return;
    }

    if (isConverting) {
      showAlert("Masih mengonversi gambar. Mohon tunggu.", "warning");
      return;
    }

    if (!imageFile && !formData.image_url) {
      showAlert("Harus mengunggah gambar paket photoshoot.", "warning");
      return;
    }

    if (!formData.features.length) {
      showAlert("Harus menambahkan minimal satu fitur.", "warning");
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    const data = buildFormData();
    try {
      const url = packageItem
        ? `/api/photoshoots/${packageItem.id}`
        : "/api/photoshoots";
      const method = packageItem ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: data });
      if (!res.ok) {
        const err = await res.json();
        showAlert(err.message || "Gagal mengirim photoshoot package.", "error");
        return;
      }

      showAlert(
        packageItem
          ? "Photoshoot package updated successfully."
          : "Photoshoot package created successfully.",
        "success"
      );
      router.refresh();
      setOpen(false);
      setShowPreview(false);
      onSubmit?.(data);
      if (!packageItem) {
        setFormData({
          name: "",
          price: 0,
          features: [],
          image_url: undefined,
        });
        setImageFile(null);
        setImagePreview("");
        setNewFeature("");
      }
    } catch (err) {
      console.error(err);
      showAlert("Gagal mengirim photoshoot package.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {packageItem ? (
          <Button variant="outline" className="gap-2">
            <SquarePen className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="default" className="flex gap-2">
            <PlusCircle className="w-4 h-4" />{" "}
            {packageItem ? "Edit Photoshoot" : "Add Photoshoot"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        {!showPreview ? (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {packageItem
                    ? "Edit Photoshoot Package"
                    : "Add Photoshoot Package"}
                </DialogTitle>
                <DialogDescription>
                  {packageItem
                    ? "Update the photoshoot package details."
                    : "Fill the form to create a new photoshoot package."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-4 space-y-4">
                {/* IMAGE */}
                <div className="space-y-2">
                  <Label>Package Image</Label>
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
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label
                        htmlFor="package-image"
                        className="cursor-pointer flex justify-center text-sm text-muted-foreground hover:text-foreground"
                      >
                        {isConverting
                          ? "Converting to WebP..."
                          : "Click or drag & drop image"}
                      </Label>
                      <Input
                        id="package-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isConverting}
                      />
                    </div>
                  )}
                </div>

                {/* NAME */}
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    placeholder="Premium Photoshoot"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* PRICE */}
                <div className="space-y-2">
                  <Label>Price (IDR)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* FEATURES */}
                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 10 edited photos"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newFeature.trim() !== "") {
                          setFormData({
                            ...formData,
                            features: [...formData.features, newFeature.trim()],
                          });
                          setNewFeature("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center border rounded p-2"
                      >
                        <span>{f}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              features: formData.features.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                <DialogTitle>Preview Photoshoot Package</DialogTitle>
                <DialogDescription>Review before submitting.</DialogDescription>
              </DialogHeader>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              )}

              <div className="border rounded-lg p-4 space-y-3">
                <p>
                  <strong>Package Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Price:</strong> Rp{" "}
                  {formData.price.toLocaleString("id-ID")}
                </p>
                {formData.features.length > 0 && (
                  <div>
                    <strong>Features:</strong>
                    <ul className="list-disc pl-6">
                      {formData.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
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
