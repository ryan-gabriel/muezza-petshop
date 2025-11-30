/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// GET /api/photoshoots
// ----------------------
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // =====================================================================
  // CLIENT MODE — include discount
  // =====================================================================
  if (clientMode) {
    let query = supabase
      .from("photoshoot_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: packages, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const today = new Date().toISOString().split("T")[0];
    const result = [];

    for (const pkg of packages) {
      // 🔎 Cari discount_target untuk photoshoot
      const { data: target } = await supabase
        .from("discount_targets")
        .select("discount_id")
        .eq("target_type", "photoshoot")
        .eq("target_id", pkg.id)
        .maybeSingle();

      let discount = null;

      if (target?.discount_id) {
        const { data: d } = await supabase
          .from("discounts")
          .select("*")
          .eq("id", target.discount_id)
          .eq("is_active", true)
          .maybeSingle();

        if (d && d.start_date <= today && d.end_date >= today) {
          discount = d; // return single object
        }
      }

      result.push({
        ...pkg,
        discount,
      });
    }

    return NextResponse.json(result);
  }

  // =====================================================================
  // ADMIN MODE — normal
  // =====================================================================
  let query = supabase
    .from("photoshoot_packages")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data || []);
}

// ----------------------
// UTIL — SLUGIFY
// ----------------------
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// ----------------------
// UTIL — Generate Unique Slug
// ----------------------
async function generateUniqueSlug(baseSlug: string, supabase: any) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("photoshoot_packages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ----------------------
// POST /api/photoshoots
// ----------------------
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: true,
          message: "Tidak memiliki akses. Silakan login terlebih dahulu.",
          detail: authError?.message || null,
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const featuresRaw = formData.get("features") as string;
    const image = formData.get("image") as File | null;

    if (!name || !price || !image) {
      return NextResponse.json(
        {
          error: true,
          message: "Data yang dibutuhkan tidak lengkap.",
          detail: {
            missing: {
              name: !name,
              price: !price,
              image: !image,
            },
          },
        },
        { status: 400 }
      );
    }

    // Convert features JSON safely
    let features: string[] = [];
    try {
      if (featuresRaw) {
        features = JSON.parse(featuresRaw);
        if (!Array.isArray(features)) {
          throw new Error("Format fitur tidak valid.");
        }
      }
    } catch (parseError: any) {
      return NextResponse.json(
        {
          error: true,
          message: "Format fitur tidak valid. Harus berupa array JSON.",
          detail: parseError.message,
        },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = slugify(name);
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // Upload image
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `photoshoot/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("photoshoot-images")
      .upload(filePath, image);

    if (uploadError) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal mengunggah gambar.",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("photoshoot-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // Insert DB record
    const { data, error } = await supabase
      .from("photoshoot_packages")
      .insert([
        {
          name,
          price: Number(price),
          features,
          image_url: imageUrl,
          slug,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal membuat paket photoshoot.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: false,
        message: "Paket photoshoot berhasil dibuat.",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating photoshoot package:", error);

    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
