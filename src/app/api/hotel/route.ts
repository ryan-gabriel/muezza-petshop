/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// GET /api/pet-hotel
// ----------------------
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // =====================================================================
  // CLIENT MODE (Include Discount)
  // =====================================================================
  if (clientMode) {
    let query = supabase
      .from("pet_hotel_rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: rooms, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const enrichedRooms = [];

    for (const room of rooms) {
      // ---- Check if this room has a discount ----
      const { data: target } = await supabase
        .from("discount_targets")
        .select("discount_id")
        .eq("target_type", "hotel")
        .eq("target_id", room.id)
        .maybeSingle();

      let discount = null;

      if (target?.discount_id) {
        const { data: d } = await supabase
          .from("discounts")
          .select("*")
          .eq("id", target.discount_id)
          .eq("is_active", true)
          .maybeSingle();

        // Validasi tanggal discount aktif (opsional, tapi recommended)
        const today = new Date().toISOString().split("T")[0];
        if (d && d.start_date <= today && d.end_date >= today) {
          discount = d;
        }
      }

      enrichedRooms.push({
        ...room,
        discount, // null or discount object
      });
    }

    return NextResponse.json(enrichedRooms);
  }

  // =====================================================================
  // ADMIN MODE (normal)
  // =====================================================================
  let query = supabase
    .from("pet_hotel_rooms")
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
      .from("pet_hotel_rooms")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ----------------------
// POST /api/pet-hotel
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
    const price_per_night = formData.get("price_per_night") as string;
    const image = formData.get("image") as File | null;

    if (!name || !price_per_night || !image) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = slugify(name);
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // Upload image
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `hotel/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-hotel-images")
      .upload(filePath, image);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("pet-hotel-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // Insert record
    const { data, error } = await supabase
      .from("pet_hotel_rooms")
      .insert([
        {
          name,
          description,
          price_per_night: Number(price_per_night),
          image_url: imageUrl,
          slug,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating pet hotel room:", error.message);
    return NextResponse.json(
      { error: "Failed to create pet hotel room" },
      { status: 500 }
    );
  }
}
