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
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Kamu tidak memiliki izin untuk melakukan aksi ini.",
          detail: authError?.message || null,
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const google_map_url = formData.get("google_map_url") as string;
    const image = formData.get("image") as File | null;

    // Validasi field
    if (!name || !description || !google_map_url || !image) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Nama, deskripsi, URL Google Maps, dan gambar wajib diisi.",
          detail: {
            name: !name ? "required" : null,
            description: !description ? "required" : null,
            google_map_url: !google_map_url ? "required" : null,
            image: !image ? "required" : null,
          },
        },
        { status: 400 }
      );
    }

    // slug dasar
    const baseSlug = slugify(name);

    // generate slug unik
    const slug = await generateUniqueSlug(baseSlug, supabase);

    // ---- Upload Gambar ----
    const ext = image.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `branches/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("branch-images")
      .upload(filePath, image);

    if (uploadError) {
      return NextResponse.json(
        {
          error: "STORAGE_UPLOAD_FAILED",
          message: "Gagal mengunggah gambar ke storage.",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("branch-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // ---- Insert DB ----
    const { data, error: insertError } = await supabase
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

    if (insertError) {
      return NextResponse.json(
        {
          error: "DB_INSERT_FAILED",
          message: "Gagal menyimpan data cabang ke database.",
          detail: insertError.message,
        },
        { status: 500 }
      );
    }

    // ---- SUCCESS ----
    return NextResponse.json(
      {
        message: "Cabang berhasil dibuat.",
        data,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating branch:", error);

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

