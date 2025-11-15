import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch products + categories
  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_categories (
        id,
        name,
        slug
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // Tambahkan filter search jika ada
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return NextResponse.json({
    count: count || 0,
    totalPages,
    next: page < totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: data || [],
  });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const category_id = Number(formData.get("category"));
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;

    if (!name || !price || !category_id || !description || !image) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate base slug
    let slug = generateSlug(name);

    // Check if slug already exists, add suffix if needed
    let counter = 1;
    let uniqueSlug = slug;

    while (true) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", uniqueSlug)
        .maybeSingle();

      if (!existing) break; // slug available
      uniqueSlug = `${slug}-${counter++}`;
    }

    slug = uniqueSlug;

    // Upload image ke Supabase Storage
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, image);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;
    // Simpan ke tabel products
    const { data, error } = await supabase
      .from("products")
      .insert([
        { name, price, category_id, description, image_url: imageUrl, slug },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
