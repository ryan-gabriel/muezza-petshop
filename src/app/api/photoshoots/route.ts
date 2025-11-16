/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ----------------------
// GET /api/photoshoots
// ----------------------
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const featuresRaw = formData.get("features") as string; // JSON string
    const image = formData.get("image") as File | null;

    if (!name || !price || !image) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert features JSON string → array safely
    let features: string[] = [];
    try {
      if (featuresRaw) {
        features = JSON.parse(featuresRaw);
        if (!Array.isArray(features)) features = [];
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_:any) {
      console.warn("Invalid features JSON:", featuresRaw);
      features = [];
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

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("photoshoot-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // Insert record
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

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating photoshoot package:", error.message);
    return NextResponse.json(
      { error: "Failed to create photoshoot package" },
      { status: 500 }
    );
  }
}

