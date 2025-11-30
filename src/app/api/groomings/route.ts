/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// GET /api/grooming
// ----------------------
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // =====================================================================
  // CLIENT MODE — Include discount
  // =====================================================================
  if (clientMode) {
    let query = supabase
      .from("grooming_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: services, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const result = [];

    for (const service of services) {
      // cari target discount untuk grooming
      const { data: target } = await supabase
        .from("discount_targets")
        .select("discount_id")
        .eq("target_type", "grooming")
        .eq("target_id", service.id)
        .maybeSingle();

      let discount = null;

      if (target?.discount_id) {
        const { data: d } = await supabase
          .from("discounts")
          .select("*")
          .eq("id", target.discount_id)
          .eq("is_active", true)
          .maybeSingle();

        if (d) {
          const today = new Date().toISOString().split("T")[0];

          if (d.start_date <= today && d.end_date >= today) {
            discount = d;
          }
        }
      }

      result.push({
        ...service,
        discount,
      });
    }

    return NextResponse.json(result);
  }

  // =====================================================================
  // ADMIN MODE — normal
  // =====================================================================
  let query = supabase
    .from("grooming_services")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
      .from("grooming_services")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ----------------------
// POST /api/grooming
// ----------------------
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // ===== AUTH CHECK =====
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Akses tidak diizinkan.",
          detail: authError?.message || null,
        },
        { status: 401 }
      );
    }

    // ===== BACA FORM DATA =====
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File | null;

    if (!name || !price || !image) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Beberapa field wajib belum diisi.",
          detail: "Field wajib: name, price, image",
        },
        { status: 400 }
      );
    }

    // ===== SLUG =====
    const baseSlug = slugify(name);
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // ===== UPLOAD IMAGE =====
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `grooming/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("grooming-images")
      .upload(filePath, image);

    if (uploadError) {
      return NextResponse.json(
        {
          error: "UPLOAD_ERROR",
          message: "Gagal mengunggah gambar.",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("grooming-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // ===== INSERT DB =====
    const { data, error } = await supabase
      .from("grooming_services")
      .insert([
        {
          name,
          description,
          price: Number(price),
          image_url: imageUrl,
          slug,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "DATABASE_ERROR",
          message: "Gagal membuat layanan grooming.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating grooming service:", error?.message);

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Terjadi kesalahan pada server.",
        detail: error?.message || error,
      },
      { status: 500 }
    );
  }
}
