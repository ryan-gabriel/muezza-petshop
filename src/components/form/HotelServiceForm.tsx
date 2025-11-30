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
import { PlusCircle, Upload, X, Eye, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PetHotelRoom } from "@/type/hotel";
import { showAlert } from "@/lib/alert";

interface PetHotelRoomFormProps {
  room?: PetHotelRoom;
  onSubmit?: (data: FormData) => void;
  trigger?: React.ReactNode;
}

export default function PetHotelRoomForm({
  room,
  onSubmit,
}: PetHotelRoomFormProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    name: room?.name || "",
    description: room?.description || "",
    price_per_night: room?.price_per_night || 0,
    image_url: room?.image_url,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    room?.image_url || ""
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
                  {
                    type: "image/webp",
                  }
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

  // ============================================
  // Remove image
  // ============================================
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((p) => ({ ...p, image_url: undefined }));
  };

  // ============================================
  // Reset if editing
  // ============================================
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || "",
        price_per_night: room.price_per_night,
        image_url: room.image_url || undefined,
      });
      setImagePreview(room.image_url || "");
    } else {
      setFormData({
        name: "",
        description: "",
        price_per_night: 0,
        image_url: undefined,
      });
      setImagePreview("");
    }

    setImageFile(null);
  }, [room]);

  // ============================================
  // Build formData
  // ============================================
  const buildFormData = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description || "");
    data.append("price_per_night", String(formData.price_per_night));

    if (imageFile) data.append("image", imageFile);
    else if (formData.image_url) data.append("image_url", formData.image_url);

    return data;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price_per_night <= 0) {
      showAlert(
        "Harus mengisi nama dan harga per malam yang valid.",
        "warning"
      );
      return;
    }
    if (isConverting) {
      showAlert("Please wait until image conversion is complete.", "warning");
      return;
    }
    if (!formData.description.trim()) {
      showAlert("Harus mengisi deskripsi.", "warning");
      return;
    }
    if (!imageFile && !formData.image_url) {
      showAlert("Harus mengunggah gambar kamar.", "warning");
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    const data = buildFormData();

    try {
      const url = room ? `/api/hotel/${room.id}` : "/api/hotel";

      const method = room ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: data });

      if (!res.ok) {
        const err = await res.json();
        showAlert(err.message || "Gagal mengirim pet hotel room.", "error");
        return;
      }

      showAlert(
        room
          ? "Pet hotel room updated successfully."
          : "Pet hotel room created successfully.",
        "success"
      );
      router.refresh();
      setOpen(false);
      setShowPreview(false);

      onSubmit?.(data);
      if (!room) {
        // RESET FORM setelah submit sukses
        setFormData({
          name: "",
          description: "",
          price_per_night: 0,
          image_url: undefined,
        });

        setImageFile(null);
        setImagePreview("");
      }
    } catch (err) {
      console.error(err);
      showAlert("Gagal mengirim pet hotel room.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {room ? (
          <Button variant="outline" className="gap-2">
            <SquarePen className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="default" className="flex gap-2">
            <PlusCircle className="w-4 h-4" /> Add Pet Hotel Room
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        {!showPreview ? (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {room ? "Edit Pet Hotel Room" : "Add Pet Hotel Room"}
                </DialogTitle>
                <DialogDescription>
                  {room
                    ? "Update the pet hotel room details."
                    : "Fill the form to create a new pet hotel room."}
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
                  <Label>Room Image</Label>

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
                        htmlFor="room-image"
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                      >
                        {isConverting
                          ? "Converting to WebP..."
                          : "Click or drag & drop image"}
                      </Label>

                      <Input
                        id="room-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isConverting}
                      />
                    </div>
                  )}
                </div>

                {/* ROOM NAME */}
                <div className="space-y-2">
                  <Label>Room Name</Label>
                  <Input
                    placeholder="Deluxe Pet Suite"
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
                    placeholder="Describe the room"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* PRICE */}
                <div className="space-y-2">
                  <Label>Price per Night (IDR)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.price_per_night}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_night: Number(e.target.value),
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
                <Button type="submit" disabled={isConverting}>
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="px-6 pt-6 pb-2">
              <DialogHeader>
                <DialogTitle>Preview Pet Hotel Room</DialogTitle>
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
                  <strong>Room Name:</strong> {formData.name}
                </p>

                {formData.description && (
                  <p>
                    <strong>Description:</strong> {formData.description}
                  </p>
                )}

                <p>
                  <strong>Price per Night:</strong> Rp{" "}
                  {formData.price_per_night.toLocaleString("id-ID")}
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
