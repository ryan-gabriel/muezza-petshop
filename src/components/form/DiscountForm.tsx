/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Discount } from "@/type/discount";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import { showAlert } from "@/lib/alert";

type TargetOption = {
  id: number;
  name: string;
};

export default function DiscountForm({ discount }: { discount?: Discount }) {
  const isEdit = !!discount;
  const [open, setOpen] = useState(false);

  // FORM STATES
  const [title, setTitle] = useState(discount?.title || "");
  const [description, setDescription] = useState(discount?.description || "");
  const [percent, setPercent] = useState(
    discount ? String(discount.discount_percent) : ""
  );
  const [startDate, setStartDate] = useState(discount?.start_date || "");
  const [endDate, setEndDate] = useState(discount?.end_date || "");

  const [targetType, setTargetType] = useState(discount?.target_type || "");
  const [search, setSearch] = useState("");

  const [options, setOptions] = useState<TargetOption[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<{
    id: number;
    name: string;
    target_type: string;
  } | null>(
    discount?.target_id
      ? {
          id: discount.target_id,
          name: discount.target_name || "",
          target_type: discount.target_type!,
        }
      : null
  );

  // IMAGE STATES
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    discount?.image_url || null
  );

  // VERY IMPORTANT: new state to track image action
  const [imageAction, setImageAction] = useState<"keep" | "replace" | "remove">(
    "keep"
  );

  // Handle upload change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageAction("replace");
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setImageAction("remove");
  };

  // Load target name on edit
  useEffect(() => {
    async function loadTarget() {
      if (!discount?.target_id || !discount.target_type) return;

      const res = await fetch(
        `/api/discount-targets?id=${discount.target_id}&type=${discount.target_type}`
      );
      const data = await res.json();

      if (data?.name) {
        setSelectedTarget({
          id: data.id,
          name: data.name,
          target_type: discount.target_type!,
        });
      }
    }

    if (isEdit) loadTarget();
  }, [discount, isEdit]);

  // Load possible target options
  useEffect(() => {
    if (!targetType) return;

    async function loadData() {
      const res = await fetch(
        `/api/discount-targets?type=${targetType}&search=${search}`
      );
      const data = await res.json();
      setOptions(data || []);
    }

    loadData();
  }, [targetType, search]);

  const chooseTarget = (item: TargetOption) => {
    setSelectedTarget({
      id: item.id,
      name: item.name,
      target_type: targetType,
    });
  };

  // SUBMIT HANDLER
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (!selectedTarget) {
        showAlert("Harap pilih target untuk diskon.", "warning");
        return;
      }

      if (!title.trim()) {
        showAlert("Harap isi judul diskon.", "warning");
        return;
      }

      if (!description.trim()) {
        showAlert("Harap isi deskripsi diskon.", "warning");
        return;
      }
      if (!percent || isNaN(Number(percent)) || Number(percent) <= 0) {
        showAlert("Harap isi persentase diskon yang valid.", "warning");
        return;
      }
      if (!startDate) {
        showAlert("Harap isi tanggal mulai diskon.", "warning");
        return;
      }

      if (!endDate) {
        showAlert("Harap isi tanggal berakhir diskon.", "warning");
        return;
      }

      if (endDate < startDate) {
        showAlert("Tanggal berakhir harus setelah tanggal mulai.", "warning");
        return;
      }

      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("discount_percent", percent);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("target_type", selectedTarget.target_type);
      formData.append("target_id", selectedTarget.id.toString());

      // ---- IMAGE HANDLING ----
      formData.append("image_action", imageAction); // IMPORTANT

      if (imageAction === "replace" && image) {
        formData.append("image", image);
      }

      // ---- CALL API ----
      const res = await fetch(
        isEdit ? `/api/discounts/${discount!.id}` : "/api/discounts",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        showAlert(err.message || "Gagal mengirim diskon.", "error");
        return;
      }

      showAlert(
        isEdit
          ? "Discount updated successfully."
          : "Discount created successfully.",
        "success"
      );

      setOpen(false);
      window.location.reload();
    } catch (_) {
      showAlert("Gagal mengirim diskon.", "error");
    }
  };

  // UI SECTION
  const FormUI = (
    <div className="space-y-8 p-6 bg-white rounded-2xl shadow-md max-w-2xl mx-auto">
      {/* ------------------ TITLE & DESCRIPTION ------------------ */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter discount title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            rows={4}
          />
        </div>
      </div>

      {/* ------------------ DISCOUNT & DATE ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="percent">Discount (%)</Label>
          <Input
            id="percent"
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* ------------------ IMAGE UPLOAD ------------------ */}
      <div className="space-y-2">
        <Label>Image (Optional)</Label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="relative w-36 h-36 border rounded-lg overflow-hidden shadow-sm">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                ✕
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------ TARGET TYPE ------------------ */}
      <div className="space-y-2">
        <Label>Target Type</Label>
        <Select
          value={targetType}
          onValueChange={(v) => {
            setTargetType(v);
            setSelectedTarget(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select target" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="hotel">Hotel Room</SelectItem>
            <SelectItem value="grooming">Grooming</SelectItem>
            <SelectItem value="addon">Addon Service</SelectItem>
            <SelectItem value="photoshoot">Photoshoot Package</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ------------------ SEARCH TARGET ------------------ */}
      {targetType && (
        <div className="space-y-2">
          <Label>Search Target</Label>
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="border rounded-md max-h-60 overflow-y-auto">
            {options.map((item) => (
              <div
                key={item.id}
                onClick={() => chooseTarget(item)}
                className="p-2 cursor-pointer hover:bg-blue-50 rounded transition"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ SELECTED TARGET ------------------ */}
      {selectedTarget && (
        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md">
          <span className="font-semibold">Selected Target:</span>{" "}
          {selectedTarget.name}
        </div>
      )}

      {/* ------------------ SUBMIT BUTTON ------------------ */}
      <Button className="w-full py-3 text-lg" onClick={handleSubmit}>
        {isEdit ? "Update Discount" : "Create Discount"}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {discount ? (
          <Button variant="outline" className="gap-2">
            <SquarePen className="w-4 h-4" />
          </Button>
        ) : (
          <Button>Add Discount</Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Discount" : "Create Discount"}
          </DialogTitle>
        </DialogHeader>

        {FormUI}
      </DialogContent>
    </Dialog>
  );
}
