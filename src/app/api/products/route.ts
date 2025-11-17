import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // =====================================================
  // CLIENT MODE → GROUPED BY CATEGORY
  // =====================================================
  if (clientMode) {
    const { data: categories, error: catErr } = await supabase
      .from("product_categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (catErr)
      return NextResponse.json({ error: catErr.message }, { status: 400 });

    const results = [];
    const discountList = []; // <── NEW

    for (const c of categories) {
      let query = supabase
        .from("products")
        .select("id, name, description, price, image_url, slug, created_at")
        .eq("category_id", c.id)
        .limit(3)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      const { data: products, error: prodErr } = await query;

      if (prodErr)
        return NextResponse.json({ error: prodErr.message }, { status: 400 });

      const enrichedProducts = [];

      for (const p of products) {
        // Cari discount target utk produk ini
        const { data: target } = await supabase
          .from("discount_targets")
          .select("discount_id")
          .eq("target_type", "product")
          .eq("target_id", p.id)
          .maybeSingle();

        let discount = null;

        if (target?.discount_id) {
          const { data: d } = await supabase
            .from("discounts")
            .select("*")
            .eq("id", target.discount_id)
            .eq("is_active", true)
            .maybeSingle();

          if (d) discount = d;
        }

        const item = { ...p, discount };

        enrichedProducts.push(item);

        // 🔥 Push ke global discount list jika produk ini punya diskon
        if (discount) {
          discountList.push({
            product: {
              id: p.id,
              name: p.name,
              slug: p.slug,
              image_url: p.image_url,
              price: p.price,
            },
            discount,
          });
        }
      }

      results.push({
        category: c.name,
        slug: c.slug,
        products: enrichedProducts,
      });
    }

    // RETURN FINAL
    return NextResponse.json({
      products: results,
      discounts: discountList,
    });
  }

  // =====================================================
  // NORMAL MODE (ADMIN) — default behaviour
  // =====================================================

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, product_categories(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // 🎯 Add discount to each product
  const productsWithDiscount = [];

  for (const p of data || []) {
    const { data: target } = await supabase
      .from("discount_targets")
      .select("discount_id")
      .eq("target_type", "product")
      .eq("target_id", p.id)
      .maybeSingle();

    let discount = null;

    if (target?.discount_id) {
      const { data: d } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", target.discount_id)
        .eq("is_active", true)
        .maybeSingle();

      if (d) discount = d;
    }

    productsWithDiscount.push({
      ...p,
      discount,
    });
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return NextResponse.json({
    count: count || 0,
    totalPages,
    next: page < totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: productsWithDiscount,
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
