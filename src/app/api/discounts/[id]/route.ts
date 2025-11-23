/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const parameter = await context.params
  const supabase = await createClient();
  const discountId = Number(parameter.id);

  if (!discountId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  // ==========================================
  // 1. CHECK: apakah ini request toggle?
  // ==========================================
  const toggleActive = req.nextUrl.searchParams.get("active") === "true";

  if (toggleActive) {
    // ambil status lama
    const { data: existing, error: getErr } = await supabase
      .from("discounts")
      .select("is_active")
      .eq("id", discountId)
      .single();

    if (getErr || !existing) {
      return NextResponse.json(
        { message: "Discount not found", error: getErr },
        { status: 404 }
      );
    }

    // toggle
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
      message: "Status updated",
      is_active: updated.is_active,
    });
  }

  // ==========================================
  // 2. OTHERWISE jalankan PATCH normal
  // ==========================================
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const discount_percent = Number(formData.get("discount_percent"));
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;

  const target_type = formData.get("target_type") as string | null;
  const target_id = Number(formData.get("target_id")) || null;

  const newImage = formData.get("image") as File | null;
  const image_action = formData.get("image_action") as string;

  // fetch existing image
  const { data: existing } = await supabase
    .from("discounts")
    .select("image_url")
    .eq("id", discountId)
    .single();

  let image_url = existing?.image_url || null;

  // REMOVE IMAGE
  if (image_action === "remove" && image_url) {
    const oldPath = image_url.split("/").pop();
    await supabase.storage
      .from("discount-images")
      .remove([`discounts/${oldPath}`]);
    image_url = null;
  }

  // REPLACE IMAGE
  if (image_action === "replace" && newImage) {
    if (image_url) {
      const oldPath = image_url.split("/").pop();
      await supabase.storage
        .from("discount-images")
        .remove([`discounts/${oldPath}`]);
    }

    const ext = newImage.name.split(".").pop();
    const filePath = `discounts/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("discount-images")
      .upload(filePath, newImage);

    if (uploadErr) {
      return NextResponse.json(
        { message: "Failed to upload new image", error: uploadErr },
        { status: 500 }
      );
    }

    const { data: publicURL } = supabase.storage
      .from("discount-images")
      .getPublicUrl(filePath);

    image_url = publicURL.publicUrl;
  }

  // UPDATE DB
  const { data: updated, error: updateErr } = await supabase
    .from("discounts")
    .update({
      title,
      description,
      discount_percent,
      start_date,
      end_date,
      image_url,
    })
    .eq("id", discountId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json(
      { message: "Failed to update discount", error: updateErr },
      { status: 500 }
    );
  }

  // UPDATE TARGET MAPPING
  if (target_type && target_id) {
    await supabase
      .from("discount_targets")
      .delete()
      .eq("discount_id", discountId);
    await supabase.from("discount_targets").insert({
      discount_id: discountId,
      target_type,
      target_id,
    });
  }

  return NextResponse.json({
    message: "Discount updated successfully",
    updated,
  });
}

// ----------------------
// DELETE — delete discount + mapping
// ----------------------
export async function DELETE(_req: Request, context: any) {
  const params = await context.params;
  const supabase = await createClient();

  const discountId = Number(params.id);

  // delete mapping first
  await supabase
    .from("discount_targets")
    .delete()
    .eq("discount_id", discountId);

  // delete discount
  const { error } = await supabase
    .from("discounts")
    .delete()
    .eq("id", discountId);

  if (error) {
    return NextResponse.json(
      { message: "Failed to delete discount", error },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
