/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// PATCH — update discount + target
// ----------------------
export async function PATCH(req: Request, context: any) {
  const params = await context.params;
  const supabase = await createClient();
  const body = await req.json();

  const discountId = Number(params.id);

  const {
    title,
    description,
    discount_percent,
    start_date,
    end_date,
    target,
  } = body;

  // --- Update discount ---
  const { data: updated, error: updateErr } = await supabase
    .from("discounts")
    .update({
      title,
      description,
      discount_percent,
      start_date,
      end_date,
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

  // --- Update target mapping ---
  if (target?.type && target?.id) {
    // remove old mapping
    await supabase
      .from("discount_targets")
      .delete()
      .eq("discount_id", discountId);

    // insert new mapping
    await supabase.from("discount_targets").insert({
      discount_id: discountId,
      target_type: target.type,
      target_id: target.id,
    });
  }

  return NextResponse.json(updated);
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
