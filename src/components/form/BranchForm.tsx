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
import { PlusCircle, Upload, X, Eye } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Branch } from "@/type/branch";

interface BranchFormProps {
  branch?: Branch;
  onSubmit?: (data: FormData) => void;
  trigger?: React.ReactNode;
}

export default function BranchForm({
  branch,
  onSubmit,
  trigger,
}: BranchFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    name: branch?.name || "",
    description: branch?.description || "",
    google_map_url: branch?.google_map_url || "",
    whatsapp_number: branch?.whatsapp_number || "",
    image_url: branch?.image_url,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    branch?.image_url || ""
  );

  // === Convert to WebP ===
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
    } catch (err) {
      console.error("Error converting image:", err);
      setIsConverting(false);
    }
  };

  // === Upload Image ===
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageConvert(file);
  };

  // === Drag & Drop ===
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

  // === Remove Image ===
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: undefined }));
  };

  // === Reset when switching between edit/create ===
  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        description: branch.description || "",
        google_map_url: branch.google_map_url || "",
        whatsapp_number: branch.whatsapp_number || "",
        image_url: branch.image_url,
      });
      setImagePreview(branch.image_url || "");
    } else {
      setFormData({
        name: "",
        description: "",
        google_map_url: "",
        whatsapp_number: "",
        image_url: undefined,
      });
      setImagePreview("");
    }

    setImageFile(null);
  }, [branch]);

  // === Build FormData ===
  const buildFormData = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    data.append("google_map_url", formData.google_map_url || "");
    data.append("whatsapp_number", formData.whatsapp_number || "");

    if (imageFile) data.append("image", imageFile);
    else if (formData.image_url) data.append("image_url", formData.image_url);

    return data;
  };

  // === Submit ===
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    const data = buildFormData();

    try {
      const url = branch ? `/api/branches/${branch.id}` : "/api/branches";
      const method = branch ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }

      router.refresh();
      setOpen(false);
      setShowPreview(false);
      onSubmit?.(data);
      if (!branch) {
        // === RESET FORM setelah submit sukses ===
        setFormData({
          name: "",
          description: "",
          google_map_url: "",
          image_url: undefined,
          whatsapp_number: "",
        });

        setImageFile(null);
        setImagePreview("");
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
            <PlusCircle className="w-4 h-4" /> Add Branch
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        {!showPreview ? (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {branch ? "Edit Branch" : "Add Branch"}
                </DialogTitle>
                <DialogDescription>
                  {branch
                    ? "Update branch information."
                    : "Fill the form to create a new branch."}
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
                  <Label>Branch Image</Label>
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
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label
                        htmlFor="branch-image"
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                      >
                        {isConverting
                          ? "Converting to WebP..."
                          : "Click or drag & drop image"}
                      </Label>
                      <Input
                        id="branch-image"
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
                  <Label htmlFor="name">Branch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    required
                    placeholder="Enter branch name"
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
                    placeholder="Branch description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* WHATSAPP NUMBER */}
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="081234567890"
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp_number: e.target.value,
                      })
                    }
                  />
                </div>

                {/* GOOGLE MAP URL */}
                <div className="space-y-2">
                  <Label>Google Map URL</Label>
                  <Input
                    placeholder="https://maps.google.com/..."
                    value={formData.google_map_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        google_map_url: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* FOOTER */}
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
                <DialogTitle>Preview Branch</DialogTitle>
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
                  <strong>Name:</strong> {formData.name}
                </p>
                {formData.description && (
                  <p>
                    <strong>Description:</strong> {formData.description}
                  </p>
                )}
                {formData.google_map_url && (
                  <p>
                    <strong>Google Maps:</strong> {formData.google_map_url}
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
