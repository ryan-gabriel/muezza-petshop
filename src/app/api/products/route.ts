import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/utilities";

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const clientMode = searchParams.get("client") === "true";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const categorySlug = searchParams.get("category")?.trim().toLowerCase() || "";

  console.log("slug: ", categorySlug);

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
    const discountList = []; // GLOBAL DISCOUNT COLLECTOR

    for (const c of categories) {
      let query = supabase
        .from("products")
        .select("id, name, price, image_url, slug, created_at")
        .eq("category_id", c.id)
        .limit(3)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%`);
      }

      const { data: products, error: prodErr } = await query;

      if (prodErr)
        return NextResponse.json({ error: prodErr.message }, { status: 400 });

      const enrichedProducts = [];

      for (const p of products) {
        // 👉 Ambil semua discount target untuk produk ini
        const { data: targets, error: targetErr } = await supabase
          .from("discount_targets")
          .select("discount_id")
          .eq("target_type", "product")
          .eq("target_id", p.id);

        if (targetErr)
          return NextResponse.json(
            { error: targetErr.message },
            { status: 400 }
          );

        // Tidak ada discount target
        if (!targets || targets.length === 0) {
          enrichedProducts.push({ ...p, discounts: [] });
          continue;
        }

        const today = new Date().toISOString().slice(0, 10);
        const activeDiscounts = [];

        // 👉 Loop semua discount_id
        for (const t of targets) {
          const { data: discount, error: discErr } = await supabase
            .from("discounts")
            .select("*")
            .eq("id", t.discount_id)
            .lte("start_date", today)
            .gte("end_date", today)
            .maybeSingle();

          if (discErr) continue;
          if (!discount) continue; // skip jika expired / belum aktif

          activeDiscounts.push(discount);

          // Push ke global discount list
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

        enrichedProducts.push({
          ...p,
          discounts: activeDiscounts, // <- array of discounts
        });
      }

      results.push({
        category: c.name,
        slug: c.slug,
        products: enrichedProducts,
      });
    }

    return NextResponse.json({
      products: results, // produk per kategori
      discounts: discountList, // semua discount aktif
    });
  }

  // =====================================================
  // NORMAL MODE (ADMIN) — default behaviour
  // =====================================================

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // STEP 1: Konversi slug → category_id
  let categoryId: number | null = null;

  if (categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (catErr)
      return NextResponse.json({ error: catErr.message }, { status: 400 });

    if (!cat)
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );

    categoryId = cat.id;
  }

  // STEP 2: Query produk + filter kategori jika ada
  let query = supabase
    .from("products")
    .select("*, product_categories(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error, count } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // STEP 3: Ambil discount
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
    const image = formData.get("image") as File | null;

    if (!name || !price || !category_id || !image) {
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
      .insert([{ name, price, category_id, image_url: imageUrl, slug }])
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
