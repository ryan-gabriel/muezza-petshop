/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  let query = supabase
    .from("branches")
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

// util slugify dasar
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// generate slug unik
async function generateUniqueSlug(baseSlug: string, supabase: any) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from("branches")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;

    // slug belum ada → siap dipakai
    if (!data) return slug;

    // slug sudah dipakai → tingkatkan suffix
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // cek auth
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
    const google_map_url = formData.get("google_map_url") as string;
    const image = formData.get("image") as File | null;

    if (!name || !description || !google_map_url || !image) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // slug dasar
    const baseSlug = slugify(name);

    // generate slug unik dari DB
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // Upload gambar
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `branches/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("branch-images")
      .upload(filePath, image);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("branch-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // Insert DB
    const { data, error } = await supabase
      .from("branches")
      .insert([
        {
          name,
          slug,
          description,
          google_map_url,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    console.error("Error creating branch:", error.message);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}
