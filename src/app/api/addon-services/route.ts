/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// GET /api/addon-services
// ----------------------
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // =====================================================================
  // CLIENT MODE — include discount (single object)
  // =====================================================================
  if (clientMode) {
    let query = supabase
      .from("addon_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: addons, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const today = new Date().toISOString().split("T")[0];
    const result = [];

    for (const addon of addons) {
      // 1) Ambil discount target untuk addon
      const { data: target } = await supabase
        .from("discount_targets")
        .select("discount_id")
        .eq("target_type", "addon")
        .eq("target_id", addon.id)
        .maybeSingle();

      let discount = null;

      // 2) Jika ada discount → ambil detail discount
      if (target?.discount_id) {
        const { data: d } = await supabase
          .from("discounts")
          .select("*")
          .eq("id", target.discount_id)
          .eq("is_active", true)
          .maybeSingle();

        // 3) Validasi tanggal discount
        if (d && d.start_date <= today && d.end_date >= today) {
          discount = d; // return sebagai single object
        }
      }

      result.push({
        ...addon,
        discount,
      });
    }

    return NextResponse.json(result);
  }

  // =====================================================================
  // ADMIN MODE — normal (no discount)
  // =====================================================================
  let query = supabase
    .from("addon_services")
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
      .from("addon_services")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ----------------------
// POST /api/addon-services
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;

    if (!name || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(name);
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // Insert WITHOUT image
    const { data, error } = await supabase
      .from("addon_services")
      .insert([
        {
          name,
          description,
          price: Number(price),
          slug,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating addon service:", error.message);
    return NextResponse.json(
      { error: "Failed to create addon service" },
      { status: 500 }
    );
  }
}
