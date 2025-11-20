/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request, context: any) {
  const params = await context.params;
  const supabase = await createClient();
  const formData = await req.formData();

  const discountId = Number(params.id);

  // ----- Form fields -----
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const discount_percent = Number(formData.get("discount_percent"));
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;

  const target_type = formData.get("target_type") as string | null;
  const target_id = Number(formData.get("target_id")) || null;

  const newImage = formData.get("image") as File | null;
  const image_action = formData.get("image_action") as string; 
  // "keep" | "replace" | "remove"

  // -----------------------
  // Step 1: fetch existing image_url
  // -----------------------
  const { data: existing } = await supabase
    .from("discounts")
    .select("image_url")
    .eq("id", discountId)
    .single();

  let image_url = existing?.image_url || null;

  // -----------------------
  // Step 2: Handle Image Logic
  // -----------------------

  // CASE A: REMOVE IMAGE
  if (image_action === "remove" && image_url) {
    const oldPath = image_url.split("/").pop();
    await supabase.storage
      .from("discount-images")
      .remove([`discounts/${oldPath}`]);

    image_url = null;
  }

  // CASE B: REPLACE IMAGE
  if (image_action === "replace" && newImage) {
    // delete old first
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

  // CASE C: KEEP IMAGE (do nothing)
  // image_url stays unchanged

  // -----------------------
  // Step 3: Update database
  // -----------------------
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

  // -----------------------
  // Step 4: Update target mapping
  // -----------------------
  if (target_type && target_id) {
    await supabase.from("discount_targets").delete().eq("discount_id", discountId);

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
