/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// -------------------------------------------------
// PATCH — Update Discount / Toggle Active
// -------------------------------------------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const parameter = await context.params;
    const supabase = await createClient();
    const discountId = Number(parameter.id);

    if (!discountId) {
      return NextResponse.json(
        { error: true, message: "ID diskon tidak valid", detail: parameter.id },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. Toggle active?
    // ==========================================
    const toggleActive = req.nextUrl.searchParams.get("active") === "true";

    if (toggleActive) {
      const { data: existing, error: getErr } = await supabase
        .from("discounts")
        .select("is_active")
        .eq("id", discountId)
        .single();

      if (getErr || !existing) {
        return NextResponse.json(
          {
            error: true,
            message: "Diskon tidak ditemukan",
            detail: getErr?.message,
          },
          { status: 404 }
        );
      }

      const newValue = !existing.is_active;

      const { data: updated, error: updateErr } = await supabase
        .from("discounts")
        .update({ is_active: newValue })
        .eq("id", discountId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json(
          {
            error: true,
            message: "Gagal memperbarui status diskon",
            detail: updateErr.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        error: false,
        message: "Status diskon berhasil diperbarui",
        is_active: updated.is_active,
      });
    }

    // ==========================================
    // 2. Normal PATCH
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
    const { data: existingData, error: fetchErr } = await supabase
      .from("discounts")
      .select("image_url")
      .eq("id", discountId)
      .single();

    if (fetchErr) {
      return NextResponse.json(
        { error: true, message: "Diskon tidak ditemukan", detail: fetchErr.message },
        { status: 404 }
      );
    }

    let image_url = existingData?.image_url || null;

    // REMOVE IMAGE
    if (image_action === "remove" && image_url) {
      const oldPath = image_url.split("/").pop();
      try {
        await supabase.storage.from("discount-images").remove([`discounts/${oldPath}`]);
        image_url = null;
      } catch (err: any) {
        return NextResponse.json(
          { error: true, message: "Gagal menghapus gambar lama", detail: err.message },
          { status: 500 }
        );
      }
    }

    // REPLACE IMAGE
    if (image_action === "replace" && newImage) {
      if (image_url) {
        const oldPath = image_url.split("/").pop();
        await supabase.storage.from("discount-images").remove([`discounts/${oldPath}`]);
      }

      const ext = newImage.name.split(".").pop();
      const filePath = `discounts/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("discount-images")
        .upload(filePath, newImage);

      if (uploadErr) {
        return NextResponse.json(
          { error: true, message: "Gagal mengunggah gambar baru", detail: uploadErr.message },
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
        { error: true, message: "Gagal memperbarui diskon", detail: updateErr.message },
        { status: 500 }
      );
    }

    // UPDATE TARGET MAPPING
    try {
      if (target_type && target_id) {
        await supabase.from("discount_targets").delete().eq("discount_id", discountId);
        await supabase.from("discount_targets").insert({
          discount_id: discountId,
          target_type,
          target_id,
        });
      }
    } catch (targetErr: any) {
      return NextResponse.json(
        { error: true, message: "Gagal memperbarui target diskon", detail: targetErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      error: false,
      message: "Diskon berhasil diperbarui",
      updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server", detail: err.message },
      { status: 500 }
    );
  }
}

// -------------------------------------------------
// DELETE — Delete Discount + Mapping
// -------------------------------------------------
export async function DELETE(_req: Request, context: any) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const discountId = Number(params.id);

    if (!discountId) {
      return NextResponse.json(
        { error: true, message: "ID diskon tidak valid", detail: params.id },
        { status: 400 }
      );
    }

    // delete mapping first
    try {
      await supabase.from("discount_targets").delete().eq("discount_id", discountId);
    } catch (mapErr: any) {
      return NextResponse.json(
        { error: true, message: "Gagal menghapus mapping target diskon", detail: mapErr.message },
        { status: 500 }
      );
    }

    // delete discount
    const { error } = await supabase.from("discounts").delete().eq("id", discountId);

    if (error) {
      return NextResponse.json(
        { error: true, message: "Gagal menghapus diskon", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: false, message: "Diskon berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json(
      { error: true, message: "Terjadi kesalahan server", detail: err.message },
      { status: 500 }
    );
  }
}

