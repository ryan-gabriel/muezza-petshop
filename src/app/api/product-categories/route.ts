import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  let query = supabase
    .from("product_categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    console.log("Testing:", search)
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUniqueSlug(supabase: any, name: string) {
  const baseSlug = generateSlug(name);

  // Ambil semua slug yang mirip
  const { data: existingSlugs } = await supabase
    .from("product_categories")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (!existingSlugs || existingSlugs.length === 0) return baseSlug;

  // Cari nomor unik untuk slug
  let counter = 1;
  let uniqueSlug = baseSlug;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const finalSlug =
      slug?.trim() || (await generateUniqueSlug(supabase, name));

    const { data, error } = await supabase
      .from("product_categories")
      .insert([{ name, slug: finalSlug, description }])
      .select(); // kembalikan data baru

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
