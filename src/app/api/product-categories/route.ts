/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    let query = supabase
      .from("product_categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal mengambil data kategori.",
          detail: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}

async function generateUniqueSlug(supabase: any, name: string) {
  const baseSlug = generateSlug(name);

  const { data: existingSlugs } = await supabase
    .from("product_categories")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (!existingSlugs || existingSlugs.length === 0) return baseSlug;

  let counter = 1;
  let uniqueSlug = baseSlug;

  const slugSet = new Set(existingSlugs.map((s: any) => s.slug));

  while (slugSet.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { name, slug, description } = body;

    // 🔎 Validasi field
    const missingFields: string[] = [];
    if (!name) missingFields.push("nama kategori");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message: "Data tidak lengkap.",
          detail: `Field yang belum diisi: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const finalSlug =
      slug?.trim() || (await generateUniqueSlug(supabase, name));

    // Insert data
    const { data, error } = await supabase
      .from("product_categories")
      .insert([{ name, slug: finalSlug, description }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: true,
          message: "Gagal membuat kategori.",
          detail: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: true,
        message: "Terjadi kesalahan pada server.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
