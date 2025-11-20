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

type TargetOption = {
  id: number;
  name: string;
};

export default function DiscountForm({
  discount,
  trigger,
}: {
  discount?: Discount;
  trigger?: React.ReactNode;
}) {
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
    if (!selectedTarget) {
      alert("Pilih target dulu!");
      return;
    }

    const formData = new FormData();

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
      console.error(await res.json());
      alert("Error saving discount");
      return;
    }

    setOpen(false);
    window.location.reload();
  };

  // UI SECTION
  const FormUI = (
    <div className="space-y-6 p-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label>Discount Percent (%)</Label>
        <Input
          type="number"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* IMAGE SECTION */}
      <div>
        <Label>Image (Optional)</Label>

        <Input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <div className="mt-2">
            <Image
              src={preview}
              alt="Preview"
              width={120}
              height={120}
              className="rounded-md border object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={handleRemoveImage}
            >
              Remove Image
            </Button>
          </div>
        )}
      </div>

      {/* TARGET TYPE */}
      <div>
        <Label>Target Type</Label>

        <Select
          value={targetType}
          onValueChange={(v) => {
            setTargetType(v);
            setSelectedTarget(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih target" />
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

      {targetType && (
        <div>
          <Label>Cari Target</Label>
          <Input
            placeholder="Cari berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {targetType && (
        <div className="border p-3 rounded-md max-h-48 overflow-y-auto">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => chooseTarget(item)}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      {selectedTarget && (
        <div className="mt-2 p-3 bg-blue-50 border rounded-md">
          <strong>Selected Target:</strong> {selectedTarget.name}
        </div>
      )}

      <Button onClick={handleSubmit}>{isEdit ? "Update" : "Create"}</Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Discount</Button>}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Discount" : "Create Discount"}</DialogTitle>
        </DialogHeader>

        {FormUI}
      </DialogContent>
    </Dialog>
  );
}
