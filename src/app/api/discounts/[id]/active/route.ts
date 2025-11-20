import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const discountId = (await params).id;
  if (!discountId) {
    return NextResponse.json(
      { message: "Invalid discount ID" },
      { status: 400 }
    );
  }

  // 1. Ambil status saat ini
  const { data: existing, error: getErr } = await supabase
    .from("discounts")
    .select("is_active")
    .eq("id", discountId)
    .maybeSingle();

  if (getErr || !existing) {
    return NextResponse.json(
      { message: "Discount not found", error: getErr },
      { status: 404 }
    );
  }

  // 2. Toggle nilainya
  const newValue = !existing.is_active;

  const { data: updated, error: updateErr } = await supabase
    .from("discounts")
    .update({ is_active: newValue })
    .eq("id", discountId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json(
      { message: "Failed to toggle status", error: updateErr },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Status updated successfully",
    is_active: updated.is_active,
  });
}
