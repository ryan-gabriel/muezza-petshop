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

  // -----------------------
  // FORM STATE
  // -----------------------
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
    discount?.target_id && discount?.target_type
      ? {
          id: discount.target_id,
          name: "Loading...",
          target_type: discount.target_type,
        }
      : null
  );

  // If edit mode → load target title for show
  useEffect(() => {
    async function loadSelectedTargetTitle() {
      if (!discount?.target_id || !discount?.target_type) return;

      const res = await fetch(
        `/api/discount-targets?id=${discount.target_id}&type=${discount.target_type}`
      );
      const data = await res.json();

      if (data?.name) {
        setSelectedTarget({
          id: data.id,
          name: discount.target_name,
          target_type: discount.target_type!,
        });
      }
    }

    if (isEdit) loadSelectedTargetTitle();
  }, [discount, isEdit]);

  // Load options when selecting type or searching
  useEffect(() => {
    if (!targetType) return;

    async function loadTargets() {
      const res = await fetch(
        `/api/discount-targets?type=${targetType}&search=${search}`
      );

      const data = await res.json();
      setOptions(data || []);
    }

    loadTargets();
  }, [targetType, search]);

  // select target handler
  const chooseTarget = (item: TargetOption) => {
    setSelectedTarget({
      id: item.id,
      name: item.name,
      target_type: targetType,
    });
  };

  // -----------------------
  // SUBMIT HANDLER
  // -----------------------
  const handleSubmit = async () => {
    if (!selectedTarget) {
      alert("Pilih target dulu!");
      return;
    }

    const payload = {
      title,
      description,
      discount_percent: Number(percent),
      start_date: startDate,
      end_date: endDate,
      target: {
        type: selectedTarget.target_type,
        id: selectedTarget.id,
      },
    };

    const res = await fetch(
      isEdit ? `/api/discounts/${discount!.id}` : "/api/discounts",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
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

  // -----------------------
  // FORM UI
  // -----------------------
  const FormUI = (
    <div className="space-y-6 p-4">
      {/* Title */}
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Discount Percent */}
      <div>
        <Label>Discount Percent (%)</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
        />
      </div>

      {/* Dates */}
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
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Target Type */}
      <div>
        <Label>Target Type</Label>
        <Select
          value={targetType}
          onValueChange={(val) => {
            setSelectedTarget(null);
            setTargetType(val);
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

      {/* Search */}
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

      {/* Options Panel */}
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

      {/* Selected Target */}
      {selectedTarget && (
        <div className="mt-2 p-3 bg-blue-50 border rounded-md text-blue-900">
          <div className="font-semibold">Selected Target:</div>
          {selectedTarget.name} ({selectedTarget.target_type})
        </div>
      )}

      <Button onClick={handleSubmit}>{isEdit ? "Update" : "Create"}</Button>
    </div>
  );

  // -----------------------
  // RETURN: Dialog Wrapper
  // -----------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button>Add Discount</Button>}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
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
