/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Ambil discount + mapping
  const { data, error } = await supabase
    .from("discounts")
    .select(
      `
      id,
      title,
      description,
      discount_percent,
      start_date,
      end_date,
      slug,
      image_url,
      is_active,
      discount_targets (
        target_type,
        target_id
      )
    `
    )
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "Failed to fetch discounts", error },
      { status: 500 }
    );
  }

  // --------------------------
  // ADD: Load target_name
  // --------------------------
  const output = [];

  for (const item of data) {
    const mapping = item.discount_targets?.[0];

    let target_name = null;

    if (mapping) {
      const { target_type, target_id } = mapping;

      let table = "";
      if (target_type === "product") table = "products";
      if (target_type === "hotel") table = "pet_hotel_rooms";
      if (target_type === "grooming") table = "grooming_services";
      if (target_type === "addon") table = "addon_services";
      if (target_type === "photoshoot") table = "photoshoot_packages";

      if (table) {
        const { data: targetRow } = await supabase
          .from(table)
          .select("name")
          .eq("id", target_id)
          .maybeSingle();

        target_name = targetRow?.name || null;
      }
    }

    output.push({
      ...item,
      target_type: mapping?.target_type || null,
      target_id: mapping?.target_id || null,
      target_name, // <——– ADDED
    });
  }

  return NextResponse.json(output);
}

// ----------------------
// UTIL — Basic slugify
// ----------------------
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // space → dash
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-"); // collapse dashes
}

// ----------------------
// UTIL — Generate Unique Slug (discounts slug checker)
// ----------------------
async function generateUniqueDiscountSlug(baseSlug: string, supabase: any) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("discounts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug; // slug available

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ----------------------
// POST — FormData + File Upload
// ----------------------
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const discount_percent = Number(formData.get("discount_percent"));
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    const target_type = formData.get("target_type") as string;
    const target_id = Number(formData.get("target_id"));

    const imageAction = (formData.get("image_action") as string) || "keep";
    const imageFile = formData.get("image") as File | null;

    if (!title || !discount_percent || !start_date || !end_date) {
      return NextResponse.json(
        {
          error: true,
          message: "Data yang dibutuhkan tidak lengkap.",
          detail: {
            missing: {
              title: !title,
              discount_percent: !discount_percent,
              start_date: !start_date,
              end_date: !end_date,
            },
          },
        },
        { status: 400 }
      );
    }

    // --------------------------
    // Step 1: Handle Image Logic
    // --------------------------
    let image_url: string | null = null;

    if (imageAction === "replace" && imageFile) {
      try {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `discounts/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("discount-images")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          return NextResponse.json(
            {
              error: true,
              message: "Gagal mengunggah gambar diskon.",
              detail: uploadError.message,
            },
            { status: 500 }
          );
        }

        const { data: publicURLData } = supabase.storage
          .from("discount-images")
          .getPublicUrl(filePath);

        image_url = publicURLData.publicUrl;
      } catch (imgError: any) {
        return NextResponse.json(
          {
            error: true,
            message: "Terjadi kesalahan saat memproses gambar.",
            detail: imgError.message,
          },
          { status: 500 }
        );
      }
    }

    // --------------------------
    // Step 2: Create Slug
    // --------------------------
    const baseSlug = slugify(title);
    let uniqueSlug: string;
    try {
      uniqueSlug = await generateUniqueDiscountSlug(baseSlug, supabase);
    } catch (slugError: any) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal membuat slug unik untuk diskon.",
          detail: slugError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------
    // Step 3: Insert Discount
    // --------------------------
    const { data: discount, error } = await supabase
      .from("discounts")
      .insert({
        title,
        description,
        discount_percent,
        start_date,
        end_date,
        slug: uniqueSlug,
        image_url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal membuat diskon baru.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    // --------------------------
    // Step 4: Create Target Mapping
    // --------------------------
    try {
      await supabase.from("discount_targets").insert({
        discount_id: discount.id,
        target_type,
        target_id,
      });
    } catch (targetError: any) {
      return NextResponse.json(
        {
          error: true,
          message: "Diskon dibuat, tetapi gagal menambahkan target.",
          detail: targetError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      error: false,
      message: "Diskon berhasil dibuat.",
      discount,
    });
  } catch (error: any) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server saat membuat diskon.",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
